"use client";
import type { WrappedData } from "@/lib/types";
import IntroCard from "./cards/IntroCard";
import GamesOwnedCard from "./cards/GamesOwnedCard";
import PlaytimeCard from "./cards/PlaytimeCard";
import MostPlayedCard from "./cards/MostPlayedCard";
import RecentObsessionCard from "./cards/RecentObsessionCard";
import ShameCard from "./cards/ShameCard";
import GenreCard from "./cards/GenreCard";
import LibraryValueCard from "./cards/LibraryValueCard";
import RarityCard from "./cards/RarityCard";
import LibraryCard from "./cards/LibraryCard";
import ShareCard from "./cards/ShareCard";

export default function WrappedExperience({ data }: { data: WrappedData }) {
  const { stats } = data;
  return (
    <div className="h-screen snap-y snap-mandatory overflow-y-scroll">
      <IntroCard player={data.player} />
      <GamesOwnedCard total={stats.totalGames} />
      <PlaytimeCard hours={stats.totalPlaytimeHours} days={stats.totalPlaytimeDays} />
      {stats.mostPlayed && <MostPlayedCard game={stats.mostPlayed} share={stats.mostPlayedShare} />}
      <RecentObsessionCard game={stats.recentObsession} />
      <ShameCard shameScore={data.shameScore} hoursToFinish={stats.hoursToFinishBacklog} daysToFinish={stats.daysToFinishBacklog} />
      <GenreCard genreDNA={data.genreDNA} topGenre={stats.topGenre} />
      <LibraryValueCard value={data.libraryValue} />
      <RarityCard badges={data.rarityBadges} />
      <LibraryCard games={data.games} />
      <ShareCard data={data} />
    </div>
  );
}
