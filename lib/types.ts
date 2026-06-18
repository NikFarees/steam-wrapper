export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;     // minutes total
  playtime_2weeks?: number;     // minutes last 2 weeks
  img_icon_url: string;
  img_logo_url?: string;
}

export interface PlayerSummary {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
  personastate: number;         // 0=offline, 1=online, 2=busy, 3=away
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
