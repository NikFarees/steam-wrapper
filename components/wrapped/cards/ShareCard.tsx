"use client";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import StoryCard from "@/components/wrapped/StoryCard";
import { formatUsd } from "@/lib/library-value";
import type { WrappedData } from "@/lib/types";

export default function ShareCard({ data }: { data: WrappedData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  async function download() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url; a.download = `steam-wrapped-${data.player.personaname}.png`; a.click();
    } finally { setBusy(false); }
  }
  return (
    <StoryCard>
      <div ref={ref} className="rounded-2xl bg-[#0b1622] p-8 ring-1 ring-[#66c0f4]/20">
        <h2 className="text-2xl font-bold text-[#66c0f4]">{data.player.personaname}&apos;s Steam Wrapped</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 text-left">
          <Stat label="Games" value={String(data.stats.totalGames)} />
          <Stat label="Hours played" value={String(data.stats.totalPlaytimeHours)} />
          <Stat label="Top genre" value={data.stats.topGenre ?? "—"} />
          <Stat label="Library value" value={formatUsd(data.libraryValue.totalCents)} />
        </div>
      </div>
      <button onClick={download} disabled={busy}
        className="mt-6 rounded-lg bg-[#66c0f4] px-5 py-2.5 font-medium text-[#0b1622] disabled:opacity-60">
        {busy ? "Generating…" : "Download share card"}
      </button>
    </StoryCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}
