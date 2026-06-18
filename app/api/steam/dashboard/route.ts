import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { GameWithMeta, PlayerSummary, WrappedData, RarityBadge } from "@/lib/types";
import { fetchOwnedGames, fetchPlayerSummary, fetchGlobalAchievementPct, fetchPlayerAchievements } from "@/lib/steam-api";
import { fetchGameMeta } from "@/lib/steam-store";
import { MOCK_GAMES, MOCK_PLAYER, MOCK_RARITY_BADGES } from "@/lib/mock-data";
import { calculateShameScore } from "@/lib/shame-score";
import { buildGenreDNA } from "@/lib/genre-dna";
import { buildWrappedStats } from "@/lib/wrapped-stats";
import { calculateLibraryValue } from "@/lib/library-value";
import { pickRarityGames } from "@/lib/rarity";

function assemble(games: GameWithMeta[], player: PlayerSummary, rarityBadges: RarityBadge[], isLiveData: boolean): WrappedData {
  return {
    player, games,
    stats: buildWrappedStats(games),
    shameScore: calculateShameScore(games),
    genreDNA: buildGenreDNA(games),
    libraryValue: calculateLibraryValue(games),
    rarityBadges,
    isLiveData,
    fetchedAt: new Date().toISOString(),
  };
}

async function buildRarity(apiKey: string, steamId: string, games: GameWithMeta[]): Promise<RarityBadge[]> {
  const top = pickRarityGames(games);
  const badges: RarityBadge[] = [];
  for (const game of top) {
    const [pct, achieved] = await Promise.all([
      fetchGlobalAchievementPct(game.appid),
      fetchPlayerAchievements(apiKey, steamId, game.appid),
    ]);
    if (!pct || !achieved || achieved.length === 0) continue;
    let rarest: { apiname: string; name?: string; description?: string } | null = null;
    let rarestPct = Infinity;
    for (const a of achieved) {
      const p = pct[a.apiname];
      if (p !== undefined && p < rarestPct) { rarestPct = p; rarest = a; }
    }
    if (rarest && rarestPct < Infinity) {
      badges.push({
        appid: game.appid, gameName: game.name,
        achievementName: rarest.name ?? rarest.apiname,
        achievementApiName: rarest.apiname,
        globalPercentage: Math.round(rarestPct * 10) / 10,
        description: rarest.description ?? "",
        iconUrl: "",
      });
    }
  }
  return badges.sort((a, b) => a.globalPercentage - b.globalPercentage).slice(0, 6);
}

export async function GET(): Promise<NextResponse<WrappedData>> {
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
        const meta = await fetchGameMeta(games.map((g) => g.appid));
        const enriched: GameWithMeta[] = games.map((g) => ({
          ...g,
          genres: meta[g.appid]?.genres ?? [],
          priceCents: meta[g.appid]?.priceCents ?? 0,
          isFree: meta[g.appid]?.isFree ?? false,
        }));
        const rarity = await buildRarity(apiKey, steamId, enriched);
        return NextResponse.json(assemble(enriched, player, rarity, true));
      }
    } catch { /* fall through to mock */ }
  }
  return NextResponse.json(assemble(MOCK_GAMES, MOCK_PLAYER, MOCK_RARITY_BADGES, false));
}
