import { describe, it, expect } from "vitest";
import { buildWrappedStats } from "@/lib/wrapped-stats";
import type { GameWithMeta } from "@/lib/types";

const g = (over: Partial<GameWithMeta>): GameWithMeta => ({
  appid: 1, name: "x", playtime_forever: 0, img_icon_url: "",
  genres: [], priceCents: 0, isFree: false, ...over,
});

describe("buildWrappedStats", () => {
  it("computes totals, most played, share, recent obsession, top genre", () => {
    const s = buildWrappedStats([
      g({ appid: 1, name: "A", playtime_forever: 6000, genres: ["RPG"] }), // 100h
      g({ appid: 2, name: "B", playtime_forever: 3000, playtime_2weeks: 600 }), // 50h, 10h recent
      g({ appid: 3, name: "C", playtime_forever: 0 }), // unplayed
    ]);
    expect(s.totalGames).toBe(3);
    expect(s.totalPlaytimeHours).toBe(150);
    expect(s.mostPlayed?.name).toBe("A");
    expect(s.mostPlayedShare).toBe(67); // 100/150
    expect(s.recentObsession?.name).toBe("B");
    expect(s.topGenre).toBe("RPG");
  });

  it("returns null recentObsession when no recent play", () => {
    const s = buildWrappedStats([g({ appid: 1, playtime_forever: 60 })]);
    expect(s.recentObsession).toBeNull();
  });

  it("handles empty library", () => {
    const s = buildWrappedStats([]);
    expect(s.totalGames).toBe(0);
    expect(s.mostPlayed).toBeNull();
    expect(s.topGenre).toBeNull();
  });
});
