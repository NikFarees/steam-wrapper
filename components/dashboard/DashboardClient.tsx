"use client";

import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, Lock } from "lucide-react";
import { useSteamData } from "@/hooks/useSteamData";
import ShameScoreCard from "@/components/dashboard/ShameScoreCard";
import BacklogCalculator from "@/components/dashboard/BacklogCalculator";
import RarityBadges from "@/components/dashboard/RarityBadges";
import GenreDNAChart from "@/components/dashboard/GenreDNAChart";
import GameLibrary from "@/components/dashboard/GameLibrary";
import { Button } from "@/components/ui/button";

export default function DashboardClient() {
  const router = useRouter();
  const { data, loading, error, refetch } = useSteamData();

  async function handleLogout() {
    await fetch("/api/auth/steam-mock", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#66c0f4] border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading Steam data</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass p-8 text-center max-w-sm">
          <p className="text-red-400 font-semibold mb-2">Failed to load</p>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <Button onClick={refetch} variant="outline" size="sm" className="mr-2 gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
          <Button onClick={handleLogout} variant="ghost" size="sm">Logout</Button>
        </div>
      </div>
    );
  }

  const isPrivate = data.isLiveData && data.games.length === 0 && data.player.communityvisibilitystate !== 3;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <header className="mx-auto mb-8 flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.player.avatarfull}
            alt={data.player.personaname}
            className="h-10 w-10 rounded-full ring-2 ring-[#66c0f4]/30"
          />
          <div>
            <h1 className="text-base font-semibold text-slate-100">{data.player.personaname}</h1>
            <p className="text-xs text-slate-500">
              {data.isLiveData ? "Live data" : "Mock data"} · {new Date(data.fetchedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-200 gap-1.5"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </Button>
      </header>

      {isPrivate && (
        <div className="mx-auto mb-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4">
            <Lock className="h-4 w-4 text-yellow-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-300">Game library is private</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Steam only returns game data for public profiles. Set game details to public in your privacy settings.
              </p>
            </div>
            <a
              href={`https://steamcommunity.com/profiles/${data.player.steamid}/edit/settings`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg border border-yellow-500/30 px-3 py-1.5 text-xs font-medium text-yellow-300 hover:bg-yellow-500/10 transition-colors"
            >
              Privacy settings
            </a>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ShameScoreCard data={data.shameScore} />
        <BacklogCalculator data={data.backlog} />
        {data.rarityBadges.length > 0 && <RarityBadges badges={data.rarityBadges} />}
        <GenreDNAChart data={data.genreDNA} />
        <GameLibrary games={data.games} />
      </main>
    </div>
  );
}
