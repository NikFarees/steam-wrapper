import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { DashboardData } from "@/lib/types";
import { fetchOwnedGames, fetchPlayerSummary } from "@/lib/steam-api";
import { MOCK_GAMES, MOCK_PLAYER, MOCK_RARITY_BADGES } from "@/lib/mock-data";
import { calculateShameScore } from "@/lib/shame-score";
import { calculateBacklog } from "@/lib/backlog-estimator";
import { buildGenreDNA } from "@/lib/genre-dna";

function assembleDashboard(
  games: typeof MOCK_GAMES,
  player: typeof MOCK_PLAYER,
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
        return NextResponse.json(assembleDashboard(games, player, true));
      }
    } catch {
      // fall through to mock
    }
  }

  return NextResponse.json(
    assembleDashboard(MOCK_GAMES, MOCK_PLAYER, false)
  );
}
