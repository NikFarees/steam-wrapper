// components/dashboard/DashboardClient.tsx

"use client";

import { useRouter } from "next/navigation";
import { useSteamData } from "@/hooks/useSteamData";
import ShameScoreCard from "@/components/dashboard/ShameScoreCard";
import BacklogCalculator from "@/components/dashboard/BacklogCalculator";
import RarityBadges from "@/components/dashboard/RarityBadges";
import GenreDNAChart from "@/components/dashboard/GenreDNAChart";
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
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#66c0f4] border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading your Steam data…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass p-8 text-center max-w-sm">
          <p className="text-red-400 font-semibold mb-4">Failed to load dashboard data</p>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <Button onClick={refetch} variant="outline" className="mr-2">Retry</Button>
          <Button onClick={handleLogout} variant="ghost">Logout</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <header className="mx-auto mb-8 flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.player.avatarfull}
            alt={data.player.personaname}
            className="h-10 w-10 rounded-full ring-2 ring-[#66c0f4]/40"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-100">{data.player.personaname}</h1>
            <p className="text-xs text-slate-500">
              {data.isLiveData ? "Live Steam data" : "Demo mode — mock data"} &middot;{" "}
              {new Date(data.fetchedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
          Logout
        </Button>
      </header>

      <main className="mx-auto max-w-7xl grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ShameScoreCard data={data.shameScore} />
        <BacklogCalculator data={data.backlog} />
        <RarityBadges badges={data.rarityBadges} />
        <GenreDNAChart data={data.genreDNA} />
      </main>
    </div>
  );
}
