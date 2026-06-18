"use client";
import StoryCard from "@/components/wrapped/StoryCard";
import type { PlayerSummary } from "@/lib/types";

export default function IntroCard({ player }: { player: PlayerSummary }) {
  return (
    <StoryCard>
      <div className="flex flex-col items-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={player.avatarfull}
          alt={player.personaname}
          className="h-24 w-24 rounded-full ring-4 ring-[#66c0f4]"
        />
        <div>
          <p className="text-2xl font-semibold text-white">
            Hey {player.personaname},
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#66c0f4]">
            here&apos;s your Steam Wrapped
          </p>
        </div>
      </div>
    </StoryCard>
  );
}
