import type { GameMeta } from "@/lib/types";

const STORE = "https://store.steampowered.com/api/appdetails";
const CONCURRENCY = 5;

type AppDetails = {
  is_free?: boolean;
  genres?: { id: string; description: string }[];
  price_overview?: { final?: number };
};
type AppDetailsEnvelope = Record<string, { success: boolean; data?: AppDetails }>;

async function fetchOne(appid: number): Promise<GameMeta | null> {
  try {
    const res = await fetch(`${STORE}?appids=${appid}&cc=us&l=en`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as AppDetailsEnvelope;
    const entry = json[String(appid)];
    if (!entry?.success || !entry.data) return null;
    const data = entry.data;
    const isFree = data.is_free === true;
    return {
      appid,
      genres: (data.genres ?? []).map((g) => g.description),
      priceCents: isFree ? 0 : data.price_overview?.final ?? 0,
      isFree,
    };
  } catch {
    return null;
  }
}

export async function fetchGameMeta(appids: number[]): Promise<Record<number, GameMeta>> {
  const result: Record<number, GameMeta> = {};
  for (let i = 0; i < appids.length; i += CONCURRENCY) {
    const batch = appids.slice(i, i + CONCURRENCY);
    const metas = await Promise.all(batch.map(fetchOne));
    for (const m of metas) if (m) result[m.appid] = m;
  }
  return result;
}
