import type { SteamGame, BacklogData, BacklogItem } from "@/lib/types";
import { getPrimaryGenre, getHoursToBeat } from "@/lib/genre-map";

export function calculateBacklog(games: SteamGame[]): BacklogData {
  const unplayed = games.filter((g) => g.playtime_forever === 0);
  const items: BacklogItem[] = unplayed.map((game) => ({
    appid: game.appid,
    name: game.name,
    estimatedHours: getHoursToBeat(game.appid),
    genre: getPrimaryGenre(game.appid),
  }));
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
