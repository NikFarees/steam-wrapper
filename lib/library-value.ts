import type { GameWithMeta, LibraryValueData } from "@/lib/types";

export function calculateLibraryValue(games: GameWithMeta[]): LibraryValueData {
  let totalCents = 0, pricedCount = 0, freeCount = 0;
  for (const game of games) {
    if (game.isFree || game.priceCents === 0) { freeCount++; continue; }
    totalCents += game.priceCents;
    pricedCount++;
  }
  return { totalCents, pricedCount, freeCount };
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
