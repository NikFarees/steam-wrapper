export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;     // minutes total
  playtime_2weeks?: number;     // minutes last 2 weeks
  img_icon_url: string;
  img_logo_url?: string;
  tags?: string[];              // top user-defined tags from SteamSpy
}

export interface PlayerSummary {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
  personastate: number;         // 0=offline, 1=online, 2=busy, 3=away
  communityvisibilitystate?: number; // 1=private, 3=public
  loccountrycode?: string;
  lastlogoff?: number;          // unix timestamp
}

export interface Achievement {
  apiname: string;
  achieved: number;             // 0 or 1
  unlocktime: number;
  name: string;
  description: string;
}

export interface ShameScoreData {
  total: number;
  unplayed: number;
  played: number;
  shameScore: number;           // 0-100 percentage
  topUnplayed: SteamGame[];     // up to 5 notable unplayed games
}

export interface BacklogItem {
  appid: number;
  name: string;
  estimatedHours: number;
  genre: string;
}

export interface BacklogData {
  totalHours: number;
  totalDays: number;
  items: BacklogItem[];
  byGenre: { genre: string; hours: number }[];
}

export interface GenreData {
  genre: string;
  playtimeHours: number;
  fullMark: number;             // for RadarChart normalization
}

export interface RarityBadge {
  appid: number;
  gameName: string;
  achievementName: string;
  achievementApiName: string;
  globalPercentage: number;     // 0-100, lower = rarer
  description: string;
  iconUrl: string;
}

export interface DashboardData {
  player: PlayerSummary;
  games: SteamGame[];
  shameScore: ShameScoreData;
  backlog: BacklogData;
  genreDNA: GenreData[];
  rarityBadges: RarityBadge[];
  isLiveData: boolean;
  fetchedAt: string;            // ISO 8601 timestamp
}

export interface SteamAPIResponse<T> {
  response: T;
}

export interface GetOwnedGamesResponse {
  game_count: number;
  games?: SteamGame[];
}

export interface GetPlayerSummariesResponse {
  players: PlayerSummary[];
}

// Per-game metadata from the Steam store appdetails endpoint.
export interface GameMeta {
  appid: number;
  genres: string[];      // official store genres, may be empty
  priceCents: number;    // current store price in cents; 0 if free/unknown
  isFree: boolean;
}

// A SteamGame enriched with store metadata.
export interface GameWithMeta extends SteamGame {
  genres: string[];
  priceCents: number;
  isFree: boolean;
}

export interface LibraryValueData {
  totalCents: number;     // sum of priceCents across games
  pricedCount: number;    // games that contributed a non-zero price
  freeCount: number;      // games counted as free ($0)
}

export interface WrappedStats {
  totalGames: number;
  totalPlaytimeHours: number;   // rounded
  totalPlaytimeDays: number;    // hours / 24, 1 decimal
  hoursToFinishBacklog: number; // sum of estimated hours for unplayed games
  daysToFinishBacklog: number;  // hoursToFinishBacklog / 8, rounded
  mostPlayed: SteamGame | null; // highest playtime_forever
  mostPlayedShare: number;      // % of total playtime, rounded
  recentObsession: SteamGame | null; // highest playtime_2weeks, else null
  topGenre: string | null;
}

export interface WrappedData {
  player: PlayerSummary;
  games: GameWithMeta[];
  stats: WrappedStats;
  shameScore: ShameScoreData;
  genreDNA: GenreData[];
  libraryValue: LibraryValueData;
  rarityBadges: RarityBadge[];
  isLiveData: boolean;
  fetchedAt: string;
}
