import type { SteamGame, ShameScoreData } from "@/lib/types";

export function calculateShameScore(games: SteamGame[]): ShameScoreData {
  if (games.length === 0) {
    return { total: 0, unplayed: 0, played: 0, shameScore: 0, topUnplayed: [] };
  }
  const unplayed = games.filter((g) => g.playtime_forever === 0);
  const played = games.filter((g) => g.playtime_forever > 0);
  const shameScore = Math.round((unplayed.length / games.length) * 100);
  const topUnplayed = [...unplayed].sort((a, b) => b.appid - a.appid).slice(0, 5);
  return { total: games.length, unplayed: unplayed.length, played: played.length, shameScore, topUnplayed };
}
