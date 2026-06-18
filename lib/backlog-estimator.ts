import type { SteamGame, BacklogData, BacklogItem } from "@/lib/types";
import { getGenreForGame, getHoursToBeat, GENRE_HOURS_TO_BEAT } from "@/lib/genre-map";

export function calculateBacklog(games: SteamGame[]): BacklogData {
  const unplayed = games.filter((g) => g.playtime_forever === 0);
  const items: BacklogItem[] = unplayed.map((game) => {
    const genre = getGenreForGame(game);
    const estimatedHours = GENRE_HOURS_TO_BEAT[genre] ?? getHoursToBeat(game.appid);
    return { appid: game.appid, name: game.name, estimatedHours, genre };
  });
  const totalHours = items.reduce((sum, item) => sum + item.estimatedHours, 0);
  const totalDays = Math.round(totalHours / 8);
  const genreMap = new Map<string, number>();
  for (const item of items) {
    genreMap.set(item.genre, (genreMap.get(item.genre) ?? 0) + item.estimatedHours);
  }
  const byGenre = Array.from(genreMap.entries())
    .map(([genre, hours]) => ({ genre, hours }))
    .sort((a, b) => b.hours - a.hours);
  return { totalHours, totalDays, items, byGenre };
}
