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
