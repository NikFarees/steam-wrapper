# Steam Wrapped — Redesign Design

**Date:** 2026-06-18
**Status:** Approved for planning

## Purpose

Turn the existing static Steam dashboard into a **Steam Wrapped** experience: a
scroll-driven, animated story that wraps up a user's Steam data — how many games
they own, how many hours they've played, how much their library is worth, what
they play, and their rarest flex — ending with a shareable summary image.

The current dashboard has a structural data problem (genre breakdown is
dominated by "Unknown") and a grid layout that does not feel fun. This redesign
fixes the data and reframes everything as an animated story.

## Goals

- Fix the "Unknown" genre problem completely.
- Reframe stats as a fun, animated, scroll-driven story (Spotify-Wrapped style).
- Add a shareable summary image as the engagement payoff.
- Keep the existing pieces that work (Shame Score, Genre radar, Rarity, Library)
  but present them as story cards, not grid tiles.

## Non-Goals

- True "money spent" — the Steam Web API does not expose purchase history or
  prices paid. We show **estimated current library value** instead, clearly
  labeled. Not actual spend.
- Year-bound "2025 Wrapped" slicing — the API cannot reliably attribute
  playtime to a calendar year. Stats are all-time.
- Full per-game achievement scan for all owned games (too many API calls).

## Key Technical Constraints

1. **No money-spent endpoint.** Best available is current store price per game
   summed into an estimated library value. Free games count as $0. Label it
   "estimated library value", never "spent".
2. **Genre data must cover all games.** The current code (`lib/steam-api.ts`,
   `fetchAppTags`) caps SteamSpy lookups at 25 games via `slice(0, 25)`. A user
   with 62 games gets 37 games with no tags → "Unknown". This must be removed.
3. **Achievements are heavy.** Achievement rarity requires per-game API calls.
   For 62 games that is ~124 calls. We cap rarity to the **top ~15 most-played
   games** only.

## Data Strategy

A single server-side fetch (in the dashboard API route) builds the full
`WrappedData` payload:

| Data | Source | Calls |
|------|--------|-------|
| Player (name, avatar) | `GetPlayerSummaries` | 1 |
| Owned games + playtime | `GetOwnedGames` (`include_appinfo`, `include_played_free_games`) | 1 |
| **Genre + price** | Official Steam store `appdetails` per appid — returns BOTH `genres` and `price_overview` | N games, throttled |
| Rarity | `GetPlayerAchievements` + `GetGlobalAchievementPercentagesForApp` | top ~15 played only |

- **Genre + price come from one source.** Steam store `appdetails`
  (`https://store.steampowered.com/api/appdetails?appids=<id>`) returns official
  `genres` and `price_overview` in one response. This single change fixes the
  genre problem AND provides library value. The old SteamSpy tag path and the
  25-game cap are removed.
- **Throttling:** concurrency-limited (~5 concurrent), cached with
  `revalidate: 86400`. Failures per-game are swallowed (game contributes no
  genre/price rather than breaking the whole payload).
- **Loading screen:** a "Building your Wrapped…" state covers fetch latency.
- **Mock fallback** is preserved for development / private profiles.

## Story Flow

Full-screen scroll-driven cards, one primary stat each, revealing on scroll:

1. **Intro** — avatar + "Hey {username}, here's your Steam Wrapped".
2. **Games owned** — big number, counts up from 0.
3. **Total playtime** — total hours + "that's {X} days".
4. **Most played** — cover art, hours, "% of all your playtime".
5. **Recent obsession** — top game by `playtime_2weeks` (skipped if no recent play).
6. **Shame Score** — % unplayed, "{N} games you never opened". Absorbs the old
   Backlog stat ("{H}h to finish · {D}d at 8h/day").
7. **Genre DNA** — radar draws in, "You're a {topGenre} player". No "Unknown".
8. **Library value** — "Your library is worth ~${X}" (estimated current value).
9. **Rarest flex** — rarest achievement, "only {X}% of players have this".
10. **Library** — full cover-art grid to explore everything.
11. **Share card** — generated PNG of top stats + download button.

## Component / File Changes

### Remove
- `fetchAppTags` and the SteamSpy path in `lib/steam-api.ts`.
- The 25-game cap.
- Standalone Backlog card — its math folds into the Shame Score card.

### Add
- `lib/steam-store.ts` — store `appdetails` fetch (genre + price), throttled + cached.
- `lib/library-value.ts` — sum prices into estimated library value.
- `components/wrapped/` — story-card components (one per story step) + a scroll
  container that orchestrates them.
- `lib/share-card.tsx` (or component) — generates the shareable PNG via
  `html-to-image`.
- `hooks/useCountUp.ts` — animated number counter.

### Reframe (reuse existing internals as card contents)
- `ShameScoreCard`, `GenreDNAChart`, `RarityBadges`, `GameLibrary` become the
  inner content of their respective story cards.

### Keep
- Auth (`SteamLoginButton`, mock auth route).
- Mock-data fallback.
- Existing unit tests; extend for new genre/value/rarity logic.

## Animations

- **framer-motion** (already installed): scroll-triggered fade/slide reveals per
  card; staggered children.
- **useCountUp**: numbers tick from 0 on reveal.
- **recharts** radar: `isAnimationActive` for draw-in.
- **Share card**: `html-to-image` exports a styled summary node to PNG for download.

## New Dependency

- `html-to-image` — render the share card DOM node to a downloadable PNG.

## Success Criteria

- Genre breakdown shows real genres for all owned games; no "Unknown" bucket.
- A scroll experience presents each stat as an animated full-screen card.
- Library value shows an estimated dollar figure, clearly labeled as estimate.
- Rarest achievement card shows a real low-global-percentage achievement.
- A share button produces a downloadable PNG of the user's key stats.
- Mock fallback still works for private/unavailable profiles.

## Testing

- Unit tests for: library-value summation (free games = $0, missing price
  handled), top-genre selection, most-played selection, shame-score math
  (incl. folded backlog hours/days).
- Existing logic tests updated to match new data shapes.
