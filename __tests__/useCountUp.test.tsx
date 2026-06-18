import { vi, beforeAll, afterAll, describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountUp } from "@/hooks/useCountUp";

beforeAll(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 8) as unknown as number);
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id as unknown as NodeJS.Timeout));
});
afterAll(() => { vi.unstubAllGlobals(); });

describe("useCountUp", () => {
  it("returns 0 when inactive", () => {
    const { result } = renderHook(() => useCountUp(100, { active: false, durationMs: 10 }));
    expect(result.current).toBe(0);
  });

  it("reaches target after duration when active", async () => {
    const { result } = renderHook(() => useCountUp(100, { active: true, durationMs: 30 }));
    await act(() => new Promise((r) => setTimeout(r, 120)));
    expect(result.current).toBe(100);
  });
});
