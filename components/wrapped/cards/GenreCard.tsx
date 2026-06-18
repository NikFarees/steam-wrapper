"use client";
import StoryCard from "@/components/wrapped/StoryCard";
import GenreDNAChart from "@/components/dashboard/GenreDNAChart";
import type { GenreData } from "@/lib/types";

export default function GenreCard({
  genreDNA,
  topGenre,
}: {
  genreDNA: GenreData[];
  topGenre: string | null;
}) {
  return (
    <StoryCard>
      <h2 className="mb-6 text-3xl font-bold text-[#66c0f4]">
        You&apos;re a {topGenre ?? "mystery"} player
      </h2>
      <GenreDNAChart data={genreDNA} />
    </StoryCard>
  );
}
