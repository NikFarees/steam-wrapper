import { describe, it, expect } from "vitest";
import { calculateShameScore } from "@/lib/shame-score";
import type { SteamGame } from "@/lib/types";

const g = (appid: number, pt: number): SteamGame => ({
  appid, name: `Game ${appid}`, playtime_forever: pt, img_icon_url: "",
});

describe("calculateShameScore", () => {
  it("returns zeros for empty list", () => {
    const r = calculateShameScore([]);
    expect(r.total).toBe(0);
    expect(r.shameScore).toBe(0);
    expect(r.topUnplayed).toHaveLength(0);
  });

  it("100% shame when all unplayed", () => {
    const r = calculateShameScore([g(1, 0), g(2, 0), g(3, 0)]);
    expect(r.shameScore).toBe(100);
    expect(r.unplayed).toBe(3);
    expect(r.played).toBe(0);
  });

  it("0% shame when all played", () => {
    const r = calculateShameScore([g(1, 60), g(2, 120)]);
    expect(r.shameScore).toBe(0);
    expect(r.topUnplayed).toHaveLength(0);
  });

  it("40% shame for 2-of-5 unplayed", () => {
    const games = [g(100, 0), g(200, 60), g(300, 0), g(400, 120), g(500, 30)];
    const r = calculateShameScore(games);
    expect(r.unplayed).toBe(2);
    expect(r.shameScore).toBe(40);
  });

  it("topUnplayed returns max 5 sorted by appid desc", () => {
    const games = Array.from({ length: 8 }, (_, i) => g((i + 1) * 100, 0));
    const r = calculateShameScore(games);
    expect(r.topUnplayed).toHaveLength(5);
    expect(r.topUnplayed[0].appid).toBe(800);
    expect(r.topUnplayed[4].appid).toBe(400);
  });

  it("excludes played games from topUnplayed", () => {
    const games = [g(1000, 0), g(2000, 500), g(3000, 0)];
    const r = calculateShameScore(games);
    expect(r.topUnplayed.map((x) => x.appid)).not.toContain(2000);
  });

  it("40% for 8-of-20 mock dataset proportions", () => {
    const played = Array.from({ length: 12 }, (_, i) => g(i + 1, (i + 1) * 60));
    const unplayed = Array.from({ length: 8 }, (_, i) => g(i + 100, 0));
    const r = calculateShameScore([...played, ...unplayed]);
    expect(r.total).toBe(20);
    expect(r.shameScore).toBe(40);
  });
});
