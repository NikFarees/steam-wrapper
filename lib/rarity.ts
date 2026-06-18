import type { SteamGame } from "@/lib/types";

export function pickRarityGames(games: SteamGame[], cap = 15): SteamGame[] {
  return games
    .filter((g) => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, cap);
}
