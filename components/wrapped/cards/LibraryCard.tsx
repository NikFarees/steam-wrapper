"use client";
import StoryCard from "@/components/wrapped/StoryCard";
import GameLibrary from "@/components/dashboard/GameLibrary";
import type { GameWithMeta } from "@/lib/types";

export default function LibraryCard({ games }: { games: GameWithMeta[] }) {
  return (
    <StoryCard>
      <h2 className="mb-6 text-3xl font-bold text-[#66c0f4]">Your whole library</h2>
      <GameLibrary games={games} />
    </StoryCard>
  );
}
