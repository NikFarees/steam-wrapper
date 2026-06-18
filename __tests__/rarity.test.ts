import { describe, it, expect } from "vitest";
import { pickRarityGames } from "@/lib/rarity";
import type { SteamGame } from "@/lib/types";

const g = (appid: number, mins: number): SteamGame => ({
  appid, name: `g${appid}`, playtime_forever: mins, img_icon_url: "",
});

describe("pickRarityGames", () => {
  it("returns top-N most played, excludes unplayed", () => {
    const out = pickRarityGames(
      [g(1, 100), g(2, 0), g(3, 500), g(4, 50)], 2
    );
    expect(out.map((x) => x.appid)).toEqual([3, 1]);
  });

  it("defaults cap to 15", () => {
    const games = Array.from({ length: 20 }, (_, i) => g(i + 1, (i + 1) * 60));
    expect(pickRarityGames(games).length).toBe(15);
  });
});
