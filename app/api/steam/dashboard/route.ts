import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { SteamGame, PlayerSummary, DashboardData } from "@/lib/types";
import { fetchOwnedGames, fetchPlayerSummary, fetchAppTags } from "@/lib/steam-api";
import { MOCK_GAMES, MOCK_PLAYER, MOCK_RARITY_BADGES } from "@/lib/mock-data";
import { calculateShameScore } from "@/lib/shame-score";
import { calculateBacklog } from "@/lib/backlog-estimator";
import { buildGenreDNA } from "@/lib/genre-dna";

function assembleDashboard(
  games: SteamGame[],
  player: PlayerSummary,
  isLiveData: boolean
): DashboardData {
  return {
    player,
    games,
    shameScore: calculateShameScore(games),
    backlog: calculateBacklog(games),
    genreDNA: buildGenreDNA(games),
    rarityBadges: MOCK_RARITY_BADGES,
    isLiveData,
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET(): Promise<NextResponse<DashboardData>> {
  const cookieStore = await cookies();
  const steamId = cookieStore.get("steamId")?.value;
  const apiKey = process.env.STEAM_API_KEY;

  if (steamId && apiKey) {
    try {
      const [games, player] = await Promise.all([
        fetchOwnedGames(apiKey, steamId),
        fetchPlayerSummary(apiKey, steamId),
      ]);
      if (games && player) {
        const tagData = await fetchAppTags(games.map((g) => g.appid));
        const gamesWithTags = games.map((g) => ({ ...g, tags: tagData[g.appid] ?? [] }));
        return NextResponse.json({
          player,
          games: gamesWithTags,
          shameScore: calculateShameScore(gamesWithTags),
          backlog: calculateBacklog(gamesWithTags),
          genreDNA: buildGenreDNA(gamesWithTags),
          rarityBadges: [],
          isLiveData: true,
          fetchedAt: new Date().toISOString(),
        });
      }
    } catch {
      // fall through to mock
    }
  }

  return NextResponse.json(
    assembleDashboard(MOCK_GAMES, MOCK_PLAYER, false)
  );
}
