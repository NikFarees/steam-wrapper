import type {
  SteamGame, PlayerSummary,
  SteamAPIResponse, GetOwnedGamesResponse, GetPlayerSummariesResponse,
} from "@/lib/types";

const BASE = "https://api.steampowered.com";

export async function fetchOwnedGames(
  apiKey: string,
  steamId: string
): Promise<SteamGame[] | null> {
  try {
    const url = new URL(`${BASE}/IPlayerService/GetOwnedGames/v0001/`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("steamid", steamId);
    url.searchParams.set("format", "json");
    url.searchParams.set("include_appinfo", "1");
    url.searchParams.set("include_played_free_games", "1");

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return null;

    const data: SteamAPIResponse<GetOwnedGamesResponse> = await res.json();
    return data?.response?.games ?? [];
  } catch {
    return null;
  }
}

export async function fetchPlayerSummary(
  apiKey: string,
  steamId: string
): Promise<PlayerSummary | null> {
  try {
    const url = new URL(`${BASE}/ISteamUser/GetPlayerSummaries/v0002/`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("steamids", steamId);
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return null;

    const data: SteamAPIResponse<GetPlayerSummariesResponse> = await res.json();
    return data?.response?.players?.[0] ?? null;
  } catch {
    return null;
  }
}

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
