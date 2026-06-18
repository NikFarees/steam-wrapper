"use client";
import StoryCard from "@/components/wrapped/StoryCard";
import RarityBadges from "@/components/dashboard/RarityBadges";
import type { RarityBadge } from "@/lib/types";

export default function RarityCard({ badges }: { badges: RarityBadge[] }) {
  return (
    <StoryCard>
      <h2 className="mb-6 text-3xl font-bold text-[#66c0f4]">Your rarest flex</h2>
      {badges.length === 0 ? (
        <p className="text-slate-400">No rare achievements found — every legend starts somewhere!</p>
      ) : (
        <RarityBadges badges={badges} />
      )}
    </StoryCard>
  );
}
