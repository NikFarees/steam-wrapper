"use client";
import StoryCard from "@/components/wrapped/StoryCard";
import ShameScoreCard from "@/components/dashboard/ShameScoreCard";
import type { ShameScoreData } from "@/lib/types";

export default function ShameCard({
  shameScore,
  hoursToFinish,
  daysToFinish,
}: {
  shameScore: ShameScoreData;
  hoursToFinish: number;
  daysToFinish: number;
}) {
  return (
    <StoryCard>
      <h2 className="mb-6 text-3xl font-bold text-[#66c0f4]">Your shelf of shame</h2>
      <ShameScoreCard data={shameScore} />
      <p className="mt-4 text-slate-400">
        {hoursToFinish}h to finish · {daysToFinish}d at 8h/day
      </p>
    </StoryCard>
  );
}
