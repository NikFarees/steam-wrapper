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
