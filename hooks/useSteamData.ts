"use client";

import { useState, useEffect } from "react";
import type { WrappedData } from "@/lib/types";

interface Result {
  data: WrappedData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSteamData(): Result {
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/steam/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<WrappedData>;
      })
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((err: Error) => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [tick]);

  return { data, loading, error, refetch: () => setTick((t) => t + 1) };
}
