import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, opts: { durationMs?: number; active: boolean }): number {
  const { durationMs = 1200, active } = opts;
  const [value, setValue] = useState(0);
  const timerId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!active) { setValue(0); return; }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (t < 1) timerId.current = setTimeout(tick, 16);
    };
    timerId.current = setTimeout(tick, 16);
    return () => { if (timerId.current) clearTimeout(timerId.current); };
  }, [target, durationMs, active]);

  return value;
}
