import type { SteamGame, GenreData } from "@/lib/types";
import { getPrimaryGenre } from "@/lib/genre-map";

export function buildGenreDNA(games: SteamGame[]): GenreData[] {
  const played = games.filter((g) => g.playtime_forever > 0);
  const genreMap = new Map<string, number>();
  for (const game of played) {
    const genre = getPrimaryGenre(game.appid);
    const hours = game.playtime_forever / 60;
    genreMap.set(genre, (genreMap.get(genre) ?? 0) + hours);
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
