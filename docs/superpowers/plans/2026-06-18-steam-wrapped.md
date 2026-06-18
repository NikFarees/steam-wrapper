# Steam Wrapped Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Steam dashboard grid with an animated, scroll-driven "Steam Wrapped" story that wraps up a user's Steam data and ends in a shareable image.

**Architecture:** A single server-side API route builds a `WrappedData` payload (player, games, genres+prices from the Steam store `appdetails` endpoint, capped achievement rarity). The client renders a vertical sequence of full-screen story cards using framer-motion scroll reveals and animated counters, reusing the existing Shame/Genre/Rarity/Library internals as card contents. A final card exports a PNG via `html-to-image`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, React 18, framer-motion (installed), recharts (installed), html-to-image (to add), Vitest + Testing Library.

## Global Constraints

- Steam Web API has NO purchase/spend endpoint — money is shown as **estimated current library value** from store prices, labeled "estimated value", never "spent". Free games = $0.
- Genre data MUST cover all owned games. The old `fetchAppTags` SteamSpy path and its 25-game cap (`lib/steam-api.ts`) are removed. No "Unknown" genre bucket.
- Achievement rarity is fetched only for the **top 15 most-played games** (per-game calls are expensive).
- Steam store `appdetails` fetches are concurrency-limited (max 5 concurrent) and cached with `revalidate: 86400`. Per-game failures are swallowed (game contributes no genre/price; never breaks the payload).
- Mock-data fallback (`lib/mock-data.ts`) must keep working for private/unavailable profiles and local dev.
- Do NOT commit unless the user explicitly asks. Each task's "Commit" step is staged for the user; run `git add` but only `git commit` when the user has said to.
- Run tests with `npx vitest run <path>`.

---

### Task 1: Extend types for Wrapped

**Files:**
- Modify: `lib/types.ts`

**Interfaces:**
- Produces: `GameMeta`, `GameWithMeta`, `LibraryValueData`, `WrappedStats`, `WrappedData`.

- [ ] **Step 1: Add new interfaces to `lib/types.ts`** (append; keep existing exports)

```ts
// Per-game metadata from the Steam store appdetails endpoint.
export interface GameMeta {
  appid: number;
  genres: string[];      // official store genres, may be empty
  priceCents: number;    // current store price in cents; 0 if free/unknown
  isFree: boolean;
}

// A SteamGame enriched with store metadata.
export interface GameWithMeta extends SteamGame {
  genres: string[];
  priceCents: number;
  isFree: boolean;
}

export interface LibraryValueData {
  totalCents: number;     // sum of priceCents across games
  pricedCount: number;    // games that contributed a non-zero price
  freeCount: number;      // games counted as free ($0)
}

export interface WrappedStats {
  totalGames: number;
  totalPlaytimeHours: number;   // rounded
  totalPlaytimeDays: number;    // hours / 24, 1 decimal
  hoursToFinishBacklog: number; // sum of estimated hours for unplayed games
  daysToFinishBacklog: number;  // hoursToFinishBacklog / 8, rounded
  mostPlayed: SteamGame | null; // highest playtime_forever
  mostPlayedShare: number;      // % of total playtime, rounded
  recentObsession: SteamGame | null; // highest playtime_2weeks, else null
  topGenre: string | null;
}

export interface WrappedData {
  player: PlayerSummary;
  games: GameWithMeta[];
  stats: WrappedStats;
  shameScore: ShameScoreData;
  genreDNA: GenreData[];
  libraryValue: LibraryValueData;
  rarityBadges: RarityBadge[];
  isLiveData: boolean;
  fetchedAt: string;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no usages yet; new types are additive).

- [ ] **Step 3: Commit** (stage only; commit when user asks)

```bash
git add lib/types.ts
# git commit -m "feat: add Wrapped data types"
```

---

### Task 2: Steam store client (genre + price)

**Files:**
- Create: `lib/steam-store.ts`
- Test: `__tests__/steam-store.test.ts`

**Interfaces:**
- Consumes: `GameMeta` from `lib/types`.
- Produces: `fetchGameMeta(appids: number[]): Promise<Record<number, GameMeta>>`.

- [ ] **Step 1: Write the failing test** in `__tests__/steam-store.test.ts`

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchGameMeta } from "@/lib/steam-store";

function appdetailsResponse(appid: number, body: unknown) {
  return { [appid]: { success: true, data: body } };
}

describe("fetchGameMeta", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("returns empty object for empty input", async () => {
    expect(await fetchGameMeta([])).toEqual({});
  });

  it("parses genres and price for a paid game", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify(appdetailsResponse(10, {
        is_free: false,
        genres: [{ id: "1", description: "Action" }, { id: "37", description: "Free to Play" }],
        price_overview: { final: 1999 },
      })))
    ));
    const out = await fetchGameMeta([10]);
    expect(out[10].genres).toEqual(["Action", "Free to Play"]);
    expect(out[10].priceCents).toBe(1999);
    expect(out[10].isFree).toBe(false);
  });

  it("treats free games as price 0", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify(appdetailsResponse(20, {
        is_free: true, genres: [{ id: "1", description: "RPG" }],
      })))
    ));
    const out = await fetchGameMeta([20]);
    expect(out[20].priceCents).toBe(0);
    expect(out[20].isFree).toBe(true);
  });

  it("swallows per-game failure without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    const out = await fetchGameMeta([30]);
    expect(out).toEqual({}); // failed game simply absent
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/steam-store.test.ts`
Expected: FAIL ("Cannot find module '@/lib/steam-store'").

- [ ] **Step 3: Implement `lib/steam-store.ts`**

```ts
import type { GameMeta } from "@/lib/types";

const STORE = "https://store.steampowered.com/api/appdetails";
const CONCURRENCY = 5;

type AppDetails = {
  is_free?: boolean;
  genres?: { id: string; description: string }[];
  price_overview?: { final?: number };
};
type AppDetailsEnvelope = Record<string, { success: boolean; data?: AppDetails }>;

async function fetchOne(appid: number): Promise<GameMeta | null> {
  try {
    const res = await fetch(`${STORE}?appids=${appid}&cc=us&l=en`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as AppDetailsEnvelope;
    const entry = json[String(appid)];
    if (!entry?.success || !entry.data) return null;
    const data = entry.data;
    const isFree = data.is_free === true;
    return {
      appid,
      genres: (data.genres ?? []).map((g) => g.description),
      priceCents: isFree ? 0 : data.price_overview?.final ?? 0,
      isFree,
    };
  } catch {
    return null;
  }
}

export async function fetchGameMeta(appids: number[]): Promise<Record<number, GameMeta>> {
  const result: Record<number, GameMeta> = {};
  for (let i = 0; i < appids.length; i += CONCURRENCY) {
    const batch = appids.slice(i, i + CONCURRENCY);
    const metas = await Promise.all(batch.map(fetchOne));
    for (const m of metas) if (m) result[m.appid] = m;
  }
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/steam-store.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit** (stage only)

```bash
git add lib/steam-store.ts __tests__/steam-store.test.ts
```

---

### Task 3: Library value calculator

**Files:**
- Create: `lib/library-value.ts`
- Test: `__tests__/library-value.test.ts`

**Interfaces:**
- Consumes: `GameWithMeta`, `LibraryValueData`.
- Produces: `calculateLibraryValue(games: GameWithMeta[]): LibraryValueData`, `formatUsd(cents: number): string`.

- [ ] **Step 1: Write the failing test** in `__tests__/library-value.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { calculateLibraryValue, formatUsd } from "@/lib/library-value";
import type { GameWithMeta } from "@/lib/types";

const g = (over: Partial<GameWithMeta>): GameWithMeta => ({
  appid: 1, name: "x", playtime_forever: 0, img_icon_url: "",
  genres: [], priceCents: 0, isFree: false, ...over,
});

describe("calculateLibraryValue", () => {
  it("sums prices, counts free games separately", () => {
    const out = calculateLibraryValue([
      g({ appid: 1, priceCents: 1999 }),
      g({ appid: 2, priceCents: 5999 }),
      g({ appid: 3, priceCents: 0, isFree: true }),
    ]);
    expect(out.totalCents).toBe(7998);
    expect(out.pricedCount).toBe(2);
    expect(out.freeCount).toBe(1);
  });

  it("handles empty library", () => {
    expect(calculateLibraryValue([])).toEqual({ totalCents: 0, pricedCount: 0, freeCount: 0 });
  });
});

describe("formatUsd", () => {
  it("formats cents as dollars", () => {
    expect(formatUsd(7998)).toBe("$79.98");
    expect(formatUsd(0)).toBe("$0.00");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/library-value.test.ts`
Expected: FAIL ("Cannot find module '@/lib/library-value'").

- [ ] **Step 3: Implement `lib/library-value.ts`**

```ts
import type { GameWithMeta, LibraryValueData } from "@/lib/types";

export function calculateLibraryValue(games: GameWithMeta[]): LibraryValueData {
  let totalCents = 0, pricedCount = 0, freeCount = 0;
  for (const game of games) {
    if (game.isFree || game.priceCents === 0) { freeCount++; continue; }
    totalCents += game.priceCents;
    pricedCount++;
  }
  return { totalCents, pricedCount, freeCount };
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/library-value.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit** (stage only)

```bash
git add lib/library-value.ts __tests__/library-value.test.ts
```

---

### Task 4: Genre DNA from official store genres

**Files:**
- Modify: `lib/genre-dna.ts`
- Test: `__tests__/genre-dna.test.ts` (create or update existing)

**Interfaces:**
- Consumes: `GameWithMeta`, `GenreData`.
- Produces: `buildGenreDNA(games: GameWithMeta[]): GenreData[]` (new signature — reads `game.genres`, no SteamSpy, no "Unknown").

Rules: only count games with `playtime_forever > 0` and at least one genre. Each played game adds its hours to EVERY genre it lists. Drop the generic store genres `"Free to Play"`, `"Early Access"`, `"Indie"`, `"Massively Multiplayer"`. Keep top 8 by hours. If a game has no usable genre, it contributes nothing (it simply won't appear; no "Unknown").

- [ ] **Step 1: Write the failing test** in `__tests__/genre-dna.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { buildGenreDNA } from "@/lib/genre-dna";
import type { GameWithMeta } from "@/lib/types";

const g = (over: Partial<GameWithMeta>): GameWithMeta => ({
  appid: 1, name: "x", playtime_forever: 0, img_icon_url: "",
  genres: [], priceCents: 0, isFree: false, ...over,
});

describe("buildGenreDNA", () => {
  it("aggregates hours per genre, ignores unplayed and generic genres", () => {
    const out = buildGenreDNA([
      g({ appid: 1, playtime_forever: 600, genres: ["Action", "RPG"] }), // 10h each
      g({ appid: 2, playtime_forever: 120, genres: ["Action", "Indie"] }), // 2h Action; Indie dropped
      g({ appid: 3, playtime_forever: 0, genres: ["Strategy"] }), // unplayed, ignored
    ]);
    const action = out.find((d) => d.genre === "Action");
    const rpg = out.find((d) => d.genre === "RPG");
    expect(action?.playtimeHours).toBe(12);
    expect(rpg?.playtimeHours).toBe(10);
    expect(out.find((d) => d.genre === "Indie")).toBeUndefined();
    expect(out.find((d) => d.genre === "Strategy")).toBeUndefined();
  });

  it("never produces an Unknown bucket", () => {
    const out = buildGenreDNA([g({ appid: 1, playtime_forever: 60, genres: [] })]);
    expect(out.find((d) => d.genre === "Unknown")).toBeUndefined();
    expect(out).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/genre-dna.test.ts`
Expected: FAIL (old signature uses `getGenreForGame`, returns "Unknown").

- [ ] **Step 3: Rewrite `lib/genre-dna.ts`**

```ts
import type { GameWithMeta, GenreData } from "@/lib/types";

const GENERIC_GENRES = new Set([
  "Free to Play", "Early Access", "Indie", "Massively Multiplayer",
]);

export function buildGenreDNA(games: GameWithMeta[]): GenreData[] {
  const genreMap = new Map<string, number>();
  for (const game of games) {
    if (game.playtime_forever <= 0) continue;
    const hours = game.playtime_forever / 60;
    for (const genre of game.genres) {
      if (GENERIC_GENRES.has(genre)) continue;
      genreMap.set(genre, (genreMap.get(genre) ?? 0) + hours);
    }
  }
  const sorted = Array.from(genreMap.entries())
    .map(([genre, playtimeHours]) => ({ genre, playtimeHours }))
    .sort((a, b) => b.playtimeHours - a.playtimeHours)
    .slice(0, 8);
  const maxHours = sorted[0]?.playtimeHours ?? 1;
  return sorted.map((entry) => ({
    genre: entry.genre,
    playtimeHours: Math.round(entry.playtimeHours),
    fullMark: Math.ceil(maxHours / 100) * 100,
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/genre-dna.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit** (stage only)

```bash
git add lib/genre-dna.ts __tests__/genre-dna.test.ts
```

---

### Task 5: Wrapped stats aggregator

**Files:**
- Create: `lib/wrapped-stats.ts`
- Test: `__tests__/wrapped-stats.test.ts`

**Interfaces:**
- Consumes: `GameWithMeta`, `WrappedStats`, `getHoursToBeat` from `lib/genre-map`.
- Produces: `buildWrappedStats(games: GameWithMeta[]): WrappedStats`.

Backlog hours reuse the existing `getHoursToBeat(appid)` from `lib/genre-map.ts` (keep that helper). `topGenre` is the first genre of the most-played game, else null.

- [ ] **Step 1: Write the failing test** in `__tests__/wrapped-stats.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { buildWrappedStats } from "@/lib/wrapped-stats";
import type { GameWithMeta } from "@/lib/types";

const g = (over: Partial<GameWithMeta>): GameWithMeta => ({
  appid: 1, name: "x", playtime_forever: 0, img_icon_url: "",
  genres: [], priceCents: 0, isFree: false, ...over,
});

describe("buildWrappedStats", () => {
  it("computes totals, most played, share, recent obsession, top genre", () => {
    const s = buildWrappedStats([
      g({ appid: 1, name: "A", playtime_forever: 6000, genres: ["RPG"] }), // 100h
      g({ appid: 2, name: "B", playtime_forever: 3000, playtime_2weeks: 600 }), // 50h, 10h recent
      g({ appid: 3, name: "C", playtime_forever: 0 }), // unplayed
    ]);
    expect(s.totalGames).toBe(3);
    expect(s.totalPlaytimeHours).toBe(150);
    expect(s.mostPlayed?.name).toBe("A");
    expect(s.mostPlayedShare).toBe(67); // 100/150
    expect(s.recentObsession?.name).toBe("B");
    expect(s.topGenre).toBe("RPG");
  });

  it("returns null recentObsession when no recent play", () => {
    const s = buildWrappedStats([g({ appid: 1, playtime_forever: 60 })]);
    expect(s.recentObsession).toBeNull();
  });

  it("handles empty library", () => {
    const s = buildWrappedStats([]);
    expect(s.totalGames).toBe(0);
    expect(s.mostPlayed).toBeNull();
    expect(s.topGenre).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/wrapped-stats.test.ts`
Expected: FAIL ("Cannot find module '@/lib/wrapped-stats'").

- [ ] **Step 3: Implement `lib/wrapped-stats.ts`**

```ts
import type { GameWithMeta, WrappedStats } from "@/lib/types";
import { getHoursToBeat } from "@/lib/genre-map";

export function buildWrappedStats(games: GameWithMeta[]): WrappedStats {
  const totalGames = games.length;
  const totalMinutes = games.reduce((s, g) => s + g.playtime_forever, 0);
  const totalPlaytimeHours = Math.round(totalMinutes / 60);
  const totalPlaytimeDays = Math.round((totalMinutes / 60 / 24) * 10) / 10;

  const unplayed = games.filter((g) => g.playtime_forever === 0);
  const hoursToFinishBacklog = unplayed.reduce((s, g) => s + getHoursToBeat(g.appid), 0);
  const daysToFinishBacklog = Math.round(hoursToFinishBacklog / 8);

  const mostPlayed = totalGames === 0 ? null
    : [...games].sort((a, b) => b.playtime_forever - a.playtime_forever)[0];
  const mostPlayedShare = mostPlayed && totalMinutes > 0
    ? Math.round((mostPlayed.playtime_forever / totalMinutes) * 100) : 0;

  const recentCandidates = games.filter((g) => (g.playtime_2weeks ?? 0) > 0);
  const recentObsession = recentCandidates.length === 0 ? null
    : [...recentCandidates].sort((a, b) => (b.playtime_2weeks ?? 0) - (a.playtime_2weeks ?? 0))[0];

  const topGenre = mostPlayed && mostPlayed.playtime_forever > 0 && mostPlayed.genres.length > 0
    ? mostPlayed.genres[0] : null;

  return {
    totalGames, totalPlaytimeHours, totalPlaytimeDays,
    hoursToFinishBacklog, daysToFinishBacklog,
    mostPlayed, mostPlayedShare, recentObsession, topGenre,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/wrapped-stats.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit** (stage only)

```bash
git add lib/wrapped-stats.ts __tests__/wrapped-stats.test.ts
```

---

### Task 6: Achievement rarity (capped, with mock fallback)

**Files:**
- Modify: `lib/steam-api.ts` (add achievement functions)
- Create: `lib/rarity.ts`
- Test: `__tests__/rarity.test.ts`

**Interfaces:**
- Consumes: `SteamGame`, `RarityBadge`.
- Produces:
  - `lib/steam-api.ts`: `fetchPlayerAchievements(apiKey, steamId, appid)`, `fetchGlobalAchievementPct(appid)` (both null-safe, return null on failure).
  - `lib/rarity.ts`: `pickRarityGames(games: SteamGame[], cap?: number): SteamGame[]` (top-N played by playtime).

Only `pickRarityGames` is unit-tested (pure). The fetch functions follow the existing null-safe pattern in `lib/steam-api.ts` and are exercised via the route at runtime; do not write network tests for them.

- [ ] **Step 1: Write the failing test** in `__tests__/rarity.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { pickRarityGames } from "@/lib/rarity";
import type { SteamGame } from "@/lib/types";

const g = (appid: number, mins: number): SteamGame => ({
  appid, name: `g${appid}`, playtime_forever: mins, img_icon_url: "",
});

describe("pickRarityGames", () => {
  it("returns top-N most played, excludes unplayed", () => {
    const out = pickRarityGames(
      [g(1, 100), g(2, 0), g(3, 500), g(4, 50)], 2
    );
    expect(out.map((x) => x.appid)).toEqual([3, 1]);
  });

  it("defaults cap to 15", () => {
    const games = Array.from({ length: 20 }, (_, i) => g(i + 1, (i + 1) * 60));
    expect(pickRarityGames(games).length).toBe(15);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/rarity.test.ts`
Expected: FAIL ("Cannot find module '@/lib/rarity'").

- [ ] **Step 3: Implement `lib/rarity.ts`**

```ts
import type { SteamGame } from "@/lib/types";

export function pickRarityGames(games: SteamGame[], cap = 15): SteamGame[] {
  return games
    .filter((g) => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, cap);
}
```

- [ ] **Step 4: Add fetch helpers to `lib/steam-api.ts`** (append, mirroring existing null-safe style)

```ts
type GlobalPctResponse = { achievementpercentages?: { achievements?: { name: string; percent: number }[] } };
type PlayerAchResponse = { playerstats?: { achievements?: { apiname: string; achieved: number; name?: string; description?: string }[] } };

export async function fetchGlobalAchievementPct(appid: number): Promise<Record<string, number> | null> {
  try {
    const url = new URL(`${BASE}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/`);
    url.searchParams.set("gameid", String(appid));
    url.searchParams.set("format", "json");
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = (await res.json()) as GlobalPctResponse;
    const out: Record<string, number> = {};
    for (const a of data?.achievementpercentages?.achievements ?? []) out[a.name] = a.percent;
    return out;
  } catch { return null; }
}

export async function fetchPlayerAchievements(apiKey: string, steamId: string, appid: number) {
  try {
    const url = new URL(`${BASE}/ISteamUserStats/GetPlayerAchievements/v0001/`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("steamid", steamId);
    url.searchParams.set("appid", String(appid));
    url.searchParams.set("l", "en");
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as PlayerAchResponse;
    return (data?.playerstats?.achievements ?? []).filter((a) => a.achieved === 1);
  } catch { return null; }
}
```

- [ ] **Step 5: Run test + typecheck**

Run: `npx vitest run __tests__/rarity.test.ts && npx tsc --noEmit`
Expected: PASS (2 tests), no type errors.

- [ ] **Step 6: Commit** (stage only)

```bash
git add lib/rarity.ts lib/steam-api.ts __tests__/rarity.test.ts
```

---

### Task 7: Rework the API route into the Wrapped payload

**Files:**
- Modify: `app/api/steam/dashboard/route.ts`
- Modify: `lib/steam-api.ts` (remove `fetchAppTags`)
- Modify: `lib/mock-data.ts` (add genres+price to mock games so mock path produces a full Wrapped)
- Test: manual via route (no unit test for the route).

**Interfaces:**
- Consumes: `fetchOwnedGames`, `fetchPlayerSummary`, `fetchGameMeta`, `buildWrappedStats`, `calculateShameScore`, `buildGenreDNA`, `calculateLibraryValue`, `pickRarityGames`, `fetchGlobalAchievementPct`, `fetchPlayerAchievements`.
- Produces: `GET` returning `WrappedData`.

- [ ] **Step 1: Add genres + price to mock games in `lib/mock-data.ts`**

Convert `MOCK_GAMES` entries to `GameWithMeta` by adding `genres` and `priceCents`/`isFree`. Example for the first few (apply real-ish genres + prices to ALL 20; free-to-play titles get `isFree: true, priceCents: 0`):

```ts
import type { GameWithMeta, PlayerSummary, RarityBadge } from "@/lib/types";

export const MOCK_GAMES: GameWithMeta[] = [
  { appid: 730, name: "Counter-Strike 2", playtime_forever: 18240, playtime_2weeks: 420, img_icon_url: "8dbc71957312bbd3baea65848b545be9eae2a355", genres: ["Action", "FPS", "Free to Play"], priceCents: 0, isFree: true },
  { appid: 570, name: "Dota 2", playtime_forever: 36000, playtime_2weeks: 180, img_icon_url: "0bbb630d63262dd66d2fdd0f7d37e8661a410075", genres: ["Strategy", "MOBA", "Free to Play"], priceCents: 0, isFree: true },
  { appid: 1245620, name: "Elden Ring", playtime_forever: 5400, img_icon_url: "3f48f9dc5ab4e0fd5a2e96a67c36a3e0e2d46a3d", genres: ["Action", "RPG"], priceCents: 5999, isFree: false },
  // ...continue for ALL remaining games. Unplayed games keep playtime_forever: 0.
];
```

(Genres should be sensible per title; prices in cents, e.g. 5999, 2999. Unplayed AAA titles get realistic prices so library value is non-trivial.)

- [ ] **Step 2: Remove `fetchAppTags` from `lib/steam-api.ts`**

Delete the `SteamSpyResponse` type and the entire `fetchAppTags` function (lines ~8-34).

- [ ] **Step 3: Rewrite `app/api/steam/dashboard/route.ts`**

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { GameWithMeta, PlayerSummary, WrappedData, RarityBadge } from "@/lib/types";
import { fetchOwnedGames, fetchPlayerSummary, fetchGlobalAchievementPct, fetchPlayerAchievements } from "@/lib/steam-api";
import { fetchGameMeta } from "@/lib/steam-store";
import { MOCK_GAMES, MOCK_PLAYER, MOCK_RARITY_BADGES } from "@/lib/mock-data";
import { calculateShameScore } from "@/lib/shame-score";
import { buildGenreDNA } from "@/lib/genre-dna";
import { buildWrappedStats } from "@/lib/wrapped-stats";
import { calculateLibraryValue } from "@/lib/library-value";
import { pickRarityGames } from "@/lib/rarity";

function assemble(games: GameWithMeta[], player: PlayerSummary, rarityBadges: RarityBadge[], isLiveData: boolean): WrappedData {
  return {
    player, games,
    stats: buildWrappedStats(games),
    shameScore: calculateShameScore(games),
    genreDNA: buildGenreDNA(games),
    libraryValue: calculateLibraryValue(games),
    rarityBadges,
    isLiveData,
    fetchedAt: new Date().toISOString(),
  };
}

async function buildRarity(apiKey: string, steamId: string, games: GameWithMeta[]): Promise<RarityBadge[]> {
  const top = pickRarityGames(games);
  const badges: RarityBadge[] = [];
  for (const game of top) {
    const [pct, achieved] = await Promise.all([
      fetchGlobalAchievementPct(game.appid),
      fetchPlayerAchievements(apiKey, steamId, game.appid),
    ]);
    if (!pct || !achieved || achieved.length === 0) continue;
    let rarest: { apiname: string; name?: string; description?: string } | null = null;
    let rarestPct = Infinity;
    for (const a of achieved) {
      const p = pct[a.apiname];
      if (p !== undefined && p < rarestPct) { rarestPct = p; rarest = a; }
    }
    if (rarest && rarestPct < Infinity) {
      badges.push({
        appid: game.appid, gameName: game.name,
        achievementName: rarest.name ?? rarest.apiname,
        achievementApiName: rarest.apiname,
        globalPercentage: Math.round(rarestPct * 10) / 10,
        description: rarest.description ?? "",
        iconUrl: "",
      });
    }
  }
  return badges.sort((a, b) => a.globalPercentage - b.globalPercentage).slice(0, 6);
}

export async function GET(): Promise<NextResponse<WrappedData>> {
  const cookieStore = await cookies();
  const steamId = cookieStore.get("steamId")?.value;
  const apiKey = process.env.STEAM_API_KEY;

  if (steamId && apiKey) {
    try {
      const [games, player] = await Promise.all([
        fetchOwnedGames(apiKey, steamId),
        fetchPlayerSummary(apiKey, steamId),
      ]);
      if (games && player) {
        const meta = await fetchGameMeta(games.map((g) => g.appid));
        const enriched: GameWithMeta[] = games.map((g) => ({
          ...g,
          genres: meta[g.appid]?.genres ?? [],
          priceCents: meta[g.appid]?.priceCents ?? 0,
          isFree: meta[g.appid]?.isFree ?? false,
        }));
        const rarity = await buildRarity(apiKey, steamId, enriched);
        return NextResponse.json(assemble(enriched, player, rarity, true));
      }
    } catch { /* fall through to mock */ }
  }
  return NextResponse.json(assemble(MOCK_GAMES, MOCK_PLAYER, MOCK_RARITY_BADGES, false));
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS. (DashboardClient still references old `data.backlog` — that is fixed in Task 11; if it errors here, proceed; tsc is re-run green at Task 11.)

- [ ] **Step 5: Commit** (stage only)

```bash
git add app/api/steam/dashboard/route.ts lib/steam-api.ts lib/mock-data.ts
```

---

### Task 8: useCountUp hook + StoryCard primitive

**Files:**
- Create: `hooks/useCountUp.ts`
- Create: `components/wrapped/StoryCard.tsx`
- Test: `__tests__/useCountUp.test.tsx`

**Interfaces:**
- Produces:
  - `useCountUp(target: number, opts?: { durationMs?: number; active: boolean }): number`
  - `StoryCard` — full-screen section with framer-motion reveal; props `{ id?: string; className?: string; children: React.ReactNode }`. Uses `whileInView` to fade/slide children up; exposes an `active` flag to children via render-prop OR simply animates on view. Keep it a presentational wrapper.

- [ ] **Step 1: Write the failing test** in `__tests__/useCountUp.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountUp } from "@/hooks/useCountUp";

describe("useCountUp", () => {
  it("returns 0 when inactive", () => {
    const { result } = renderHook(() => useCountUp(100, { active: false, durationMs: 10 }));
    expect(result.current).toBe(0);
  });

  it("reaches target after duration when active", async () => {
    const { result } = renderHook(() => useCountUp(100, { active: true, durationMs: 30 }));
    await act(() => new Promise((r) => setTimeout(r, 80)));
    expect(result.current).toBe(100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/useCountUp.test.tsx`
Expected: FAIL ("Cannot find module '@/hooks/useCountUp'").

- [ ] **Step 3: Implement `hooks/useCountUp.ts`**

```ts
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, opts: { durationMs?: number; active: boolean }): number {
  const { durationMs = 1200, active } = opts;
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) { setValue(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, durationMs, active]);

  return value;
}
```

- [ ] **Step 4: Implement `components/wrapped/StoryCard.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function StoryCard({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className="flex min-h-screen snap-start items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full max-w-2xl text-center ${className}`}
      >
        {children}
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run __tests__/useCountUp.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit** (stage only)

```bash
git add hooks/useCountUp.ts components/wrapped/StoryCard.tsx __tests__/useCountUp.test.tsx
```

---

### Task 9: Stat story cards

**Files:**
- Create: `components/wrapped/cards/IntroCard.tsx`, `GamesOwnedCard.tsx`, `PlaytimeCard.tsx`, `MostPlayedCard.tsx`, `RecentObsessionCard.tsx`, `LibraryValueCard.tsx`

**Interfaces:**
- Consumes: `WrappedData`/`WrappedStats`/`LibraryValueData`, `useCountUp`, `StoryCard`, `formatUsd`.
- Produces: six default-exported card components. Each takes the slice of data it needs and an `active: boolean` prop (true when its card is the one in view — for now pass `active` from an IntersectionObserver in Task 11, or default each card to animate on mount via `useCountUp(..., { active: true })`). To keep cards self-contained, each card runs its own `useInView` from framer-motion and passes that to `useCountUp`.

Card contract example (`GamesOwnedCard.tsx`):

```tsx
"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import StoryCard from "@/components/wrapped/StoryCard";
import { useCountUp } from "@/hooks/useCountUp";

export default function GamesOwnedCard({ total }: { total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const n = useCountUp(total, { active: inView });
  return (
    <StoryCard>
      <div ref={ref}>
        <p className="text-lg text-slate-400">You own</p>
        <p className="my-3 text-7xl font-bold text-[#66c0f4]">{n}</p>
        <p className="text-lg text-slate-400">games on Steam</p>
      </div>
    </StoryCard>
  );
}
```

- [ ] **Step 1: Implement the six cards** following that pattern:
  - `IntroCard({ player })` — avatar + "Hey {personaname}, here's your Steam Wrapped".
  - `GamesOwnedCard({ total })` — as above.
  - `PlaytimeCard({ hours, days })` — count up hours; subtext "that's {days} days".
  - `MostPlayedCard({ game, share })` — cover art (`https://steamcdn-a.akamaihd.net/steam/apps/{appid}/header.jpg`), hours, "{share}% of your playtime".
  - `RecentObsessionCard({ game })` — renders nothing (`return null`) if `game` is null; else recent game + 2-week hours.
  - `LibraryValueCard({ value })` — count up dollars; label "estimated library value · not money spent".

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit** (stage only)

```bash
git add components/wrapped/cards/
```

---

### Task 10: Reused-content cards (Shame, Genre, Rarity, Library) + Share card

**Files:**
- Create: `components/wrapped/cards/ShameCard.tsx`, `GenreCard.tsx`, `RarityCard.tsx`, `LibraryCard.tsx`, `ShareCard.tsx`
- Modify: `package.json` (add `html-to-image`)

**Interfaces:**
- Consumes: existing `ShameScoreCard`, `GenreDNAChart`, `RarityBadges`, `GameLibrary` internals; `WrappedData`.
- Produces: five card components. `ShareCard` exports a PNG.

- [ ] **Step 1: Install html-to-image**

Run: `npm install html-to-image`
Expected: adds dependency, exit 0.

- [ ] **Step 2: Implement wrapper cards** — each wraps the existing component inside a `StoryCard`, with a headline:
  - `ShameCard({ shameScore, daysToFinish, hoursToFinish })` — headline "Your shelf of shame", render `<ShameScoreCard data={shameScore} />`, plus a line "{hoursToFinish}h to finish · {daysToFinish}d at 8h/day" (this is the absorbed Backlog stat).
  - `GenreCard({ genreDNA, topGenre })` — headline "You're a {topGenre} player", render `<GenreDNAChart data={genreDNA} />`.
  - `RarityCard({ badges })` — headline "Your rarest flex", render `<RarityBadges badges={badges} />`; if `badges.length === 0` render a friendly "No rare achievements found" message.
  - `LibraryCard({ games })` — headline "Your whole library", render `<GameLibrary games={games} />`.

- [ ] **Step 3: Implement `ShareCard.tsx`**

```tsx
"use client";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import StoryCard from "@/components/wrapped/StoryCard";
import { formatUsd } from "@/lib/library-value";
import type { WrappedData } from "@/lib/types";

export default function ShareCard({ data }: { data: WrappedData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  async function download() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url; a.download = `steam-wrapped-${data.player.personaname}.png`; a.click();
    } finally { setBusy(false); }
  }
  return (
    <StoryCard>
      <div ref={ref} className="rounded-2xl bg-[#0b1622] p-8 ring-1 ring-[#66c0f4]/20">
        <h2 className="text-2xl font-bold text-[#66c0f4]">{data.player.personaname}'s Steam Wrapped</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 text-left">
          <Stat label="Games" value={String(data.stats.totalGames)} />
          <Stat label="Hours played" value={String(data.stats.totalPlaytimeHours)} />
          <Stat label="Top genre" value={data.stats.topGenre ?? "—"} />
          <Stat label="Library value" value={formatUsd(data.libraryValue.totalCents)} />
        </div>
      </div>
      <button onClick={download} disabled={busy}
        className="mt-6 rounded-lg bg-[#66c0f4] px-5 py-2.5 font-medium text-[#0b1622] disabled:opacity-60">
        {busy ? "Generating…" : "Download share card"}
      </button>
    </StoryCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit** (stage only)

```bash
git add components/wrapped/cards/ package.json package-lock.json
```

---

### Task 11: Wire the Wrapped experience into the dashboard

**Files:**
- Create: `components/wrapped/WrappedExperience.tsx`
- Modify: `components/dashboard/DashboardClient.tsx` (render WrappedExperience instead of the grid)
- Modify: `hooks/useSteamData.ts` (return type `WrappedData` — verify)
- Delete: `components/dashboard/BacklogCalculator.tsx`, `lib/backlog-estimator.ts`, and any backlog test (folded into Shame/stats)
- Modify: `app/globals.css` (add `scroll-snap` container styles if desired)

**Interfaces:**
- Consumes: all cards from Tasks 9-10, `WrappedData`.
- Produces: `WrappedExperience({ data })` rendering the ordered card sequence inside a scroll-snap container, plus a fixed header (avatar + logout) and the private-profile warning (ported from current DashboardClient).

- [ ] **Step 1: Implement `WrappedExperience.tsx`** — ordered sequence:

```tsx
"use client";
import type { WrappedData } from "@/lib/types";
import IntroCard from "./cards/IntroCard";
import GamesOwnedCard from "./cards/GamesOwnedCard";
import PlaytimeCard from "./cards/PlaytimeCard";
import MostPlayedCard from "./cards/MostPlayedCard";
import RecentObsessionCard from "./cards/RecentObsessionCard";
import ShameCard from "./cards/ShameCard";
import GenreCard from "./cards/GenreCard";
import LibraryValueCard from "./cards/LibraryValueCard";
import RarityCard from "./cards/RarityCard";
import LibraryCard from "./cards/LibraryCard";
import ShareCard from "./cards/ShareCard";

export default function WrappedExperience({ data }: { data: WrappedData }) {
  const { stats } = data;
  return (
    <div className="h-screen snap-y snap-mandatory overflow-y-scroll">
      <IntroCard player={data.player} />
      <GamesOwnedCard total={stats.totalGames} />
      <PlaytimeCard hours={stats.totalPlaytimeHours} days={stats.totalPlaytimeDays} />
      {stats.mostPlayed && <MostPlayedCard game={stats.mostPlayed} share={stats.mostPlayedShare} />}
      <RecentObsessionCard game={stats.recentObsession} />
      <ShameCard shameScore={data.shameScore} hoursToFinish={stats.hoursToFinishBacklog} daysToFinish={stats.daysToFinishBacklog} />
      <GenreCard genreDNA={data.genreDNA} topGenre={stats.topGenre} />
      <LibraryValueCard value={data.libraryValue} />
      <RarityCard badges={data.rarityBadges} />
      <LibraryCard games={data.games} />
      <ShareCard data={data} />
    </div>
  );
}
```

- [ ] **Step 2: Update `DashboardClient.tsx`** — keep loading/error/logout/private-warning logic; replace the `<main>` grid with `<WrappedExperience data={data} />`. Remove imports of the now-unused individual dashboard cards and `BacklogCalculator`.

- [ ] **Step 3: Delete dead files**

```bash
git rm components/dashboard/BacklogCalculator.tsx lib/backlog-estimator.ts
# remove backlog test if present:
git rm -f __tests__/backlog-estimator.test.ts 2>/dev/null || true
```

Also remove `calculateBacklog`/`BacklogData`/`BacklogItem` usages and the `backlog` field from `DashboardData` if `DashboardData` is now unused (the route returns `WrappedData`). Keep `BacklogData` type only if still referenced; otherwise delete it from `lib/types.ts`.

- [ ] **Step 4: Verify build, types, tests**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: types PASS, all tests PASS, production build succeeds.

- [ ] **Step 5: Manual smoke test**

Run: `npm run dev`, open `http://localhost:3000`, log in (mock), confirm: cards scroll-snap, numbers count up, genre card has no "Unknown", library value shows a dollar amount, share button downloads a PNG.

- [ ] **Step 6: Commit** (stage only)

```bash
git add -A
```

---

### Task 12: Cleanup pass

**Files:**
- Modify: `lib/types.ts` (drop now-dead `BacklogData`, `BacklogItem`, and `DashboardData` if unreferenced)
- Modify: `lib/genre-map.ts` (keep `getHoursToBeat`/`getPrimaryGenre`; drop `getGenreForGame` + `GENERIC_TAGS` if unreferenced)
- Modify: `next.config.*` (ensure `steamcdn-a.akamaihd.net` / `cdn.cloudflare.steamstatic.com` allowed if using `next/image`; current code uses plain `<img>`, so only needed if a card switched to `next/image`)

- [ ] **Step 1: Grep for dead references**

Run: `grep -rn "calculateBacklog\|getGenreForGame\|fetchAppTags\|DashboardData\|BacklogData" lib app components hooks __tests__`
Expected: no results (or only type definitions about to be deleted).

- [ ] **Step 2: Delete confirmed-dead exports** found above.

- [ ] **Step 3: Final verification**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: all green.

- [ ] **Step 4: Commit** (stage only)

```bash
git add -A
```

---

## Self-Review Notes

- **Spec coverage:** Intro/owned/playtime/most-played/recent/shame/genre/value/rarity/library/share cards → Tasks 8-11. Genre fix (no Unknown) → Task 4. Library value → Tasks 2-3, 10. Rarity cap → Task 6. Animations → Tasks 8-10. Share image → Task 10. Mock fallback → Task 7. All spec success criteria mapped.
- **Type consistency:** `GameWithMeta`/`WrappedData`/`WrappedStats`/`LibraryValueData` defined in Task 1, consumed identically downstream. `buildGenreDNA` signature changed to `(GameWithMeta[])` in Task 4 and called that way in Task 7. `pickRarityGames` default cap 15 matches spec.
- **No money-spent claim:** LibraryValueCard + ShareCard label it "estimated value", never "spent".
