import { describe, it, expect } from "vitest";
import { calculateLibraryValue, formatUsd } from "@/lib/library-value";
import type { GameWithMeta } from "@/lib/types";

const g = (over: Partial<GameWithMeta>): GameWithMeta => ({
  appid: 1, name: "x", playtime_forever: 0, img_icon_url: "",
  genres: [], priceCents: 0, isFree: false, ...over,
});

describe("calculateLibraryValue", () => {
  it("sums prices, counts free games separately", () => {
    const out = calculateLibraryValue([
      g({ appid: 1, priceCents: 1999 }),
      g({ appid: 2, priceCents: 5999 }),
      g({ appid: 3, priceCents: 0, isFree: true }),
    ]);
    expect(out.totalCents).toBe(7998);
    expect(out.pricedCount).toBe(2);
    expect(out.freeCount).toBe(1);
  });

  it("handles empty library", () => {
    expect(calculateLibraryValue([])).toEqual({ totalCents: 0, pricedCount: 0, freeCount: 0 });
  });
});

describe("formatUsd", () => {
  it("formats cents as dollars", () => {
    expect(formatUsd(7998)).toBe("$79.98");
    expect(formatUsd(0)).toBe("$0.00");
  });
});
