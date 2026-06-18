import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountUp } from "@/hooks/useCountUp";

describe("useCountUp", () => {
  it("returns 0 when inactive", () => {
    const { result } = renderHook(() => useCountUp(100, { active: false, durationMs: 10 }));
    expect(result.current).toBe(0);
  });

  it("reaches target after duration when active", async () => {
    const { result } = renderHook(() => useCountUp(100, { active: true, durationMs: 30 }));
    await act(() => new Promise((r) => setTimeout(r, 80)));
    expect(result.current).toBe(100);
  });
});
