export const APPID_GENRE_MAP: Record<number, string[]> = {
  730:     ["FPS", "Competitive", "Action"],
  570:     ["MOBA", "Strategy", "Action"],
  1245620: ["Action RPG", "Souls-like", "Fantasy"],
  1091500: ["Action RPG", "Open World", "Sci-Fi"],
  1174180: ["Action Adventure", "Open World", "Western"],
  292030:  ["Action RPG", "Open World", "Fantasy"],
  1672970: ["Action RPG", "Open World", "Fantasy"],
  2050650: ["Survival Horror", "Action", "Third-Person"],
  1817070: ["Action RPG", "Open World", "Sci-Fi"],
  218620:  ["FPS", "Co-op", "Action"],
  252490:  ["Survival", "Open World", "Multiplayer"],
  105600:  ["Sandbox", "Survival", "Adventure"],
  413150:  ["Simulation", "Farming", "RPG"],
  814380:  ["Action", "Souls-like", "Stealth"],
  230410:  ["Action", "Sci-Fi", "Third-Person"],
  1054340: ["Roguelike", "Action", "Dungeon Crawler"],
  1938090: ["FPS", "Competitive", "Action"],
  391220:  ["Action Adventure", "Stealth", "Third-Person"],
  1551360: ["Racing", "Open World", "Simulation"],
  1517290: ["FPS", "Multiplayer", "Action"],
};

export const GENRE_HOURS_TO_BEAT: Record<string, number> = {
  "FPS":              12,
  "MOBA":             20,
  "Action RPG":       45,
  "Action Adventure": 25,
  "Survival Horror":  18,
  "Survival":         30,
  "Sandbox":          35,
  "Simulation":       30,
  "Roguelike":        20,
  "Racing":           15,
  "Action":           18,
  "Souls-like":       40,
  "Competitive":      12,
  "Open World":       45,
  "Co-op":            15,
};

export const FALLBACK_HOURS_TABLE: number[] = [12, 18, 25, 35, 45, 20, 30];

export function getPrimaryGenre(appid: number): string {
  return APPID_GENRE_MAP[appid]?.[0] ?? "Unknown";
}

export function getHoursToBeat(appid: number): number {
  const genre = getPrimaryGenre(appid);
  if (genre !== "Unknown" && GENRE_HOURS_TO_BEAT[genre] !== undefined) {
    return GENRE_HOURS_TO_BEAT[genre];
  }
  return FALLBACK_HOURS_TABLE[appid % 7];
}

const GENERIC_TAGS = new Set([
  "Free to Play", "Multiplayer", "Online Co-Op", "Co-op", "Online PvP",
  "Early Access", "Indie", "Singleplayer", "Single-player", "Full controller support",
  "Controller", "Steam Achievements", "Steam Cloud", "Great Soundtrack",
]);

export function getGenreForGame(game: { appid: number; tags?: string[] }): string {
  if (game.tags && game.tags.length > 0) {
    const meaningful = game.tags.find((t) => !GENERIC_TAGS.has(t));
    return meaningful ?? game.tags[0];
  }
  return getPrimaryGenre(game.appid);
}
