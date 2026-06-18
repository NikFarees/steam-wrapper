import { describe, it, expect } from "vitest";
import { buildGenreDNA } from "@/lib/genre-dna";
import type { GameWithMeta } from "@/lib/types";

const g = (over: Partial<GameWithMeta>): GameWithMeta => ({
  appid: 1, name: "x", playtime_forever: 0, img_icon_url: "",
  genres: [], priceCents: 0, isFree: false, ...over,
});

describe("buildGenreDNA", () => {
  it("aggregates hours per genre, ignores unplayed and generic genres", () => {
    const out = buildGenreDNA([
      g({ appid: 1, playtime_forever: 600, genres: ["Action", "RPG"] }), // 10h each
      g({ appid: 2, playtime_forever: 120, genres: ["Action", "Indie"] }), // 2h Action; Indie dropped
      g({ appid: 3, playtime_forever: 0, genres: ["Strategy"] }), // unplayed, ignored
    ]);
    const action = out.find((d) => d.genre === "Action");
    const rpg = out.find((d) => d.genre === "RPG");
    expect(action?.playtimeHours).toBe(12);
    expect(rpg?.playtimeHours).toBe(10);
    expect(out.find((d) => d.genre === "Indie")).toBeUndefined();
    expect(out.find((d) => d.genre === "Strategy")).toBeUndefined();
  });

  it("never produces an Unknown bucket", () => {
    const out = buildGenreDNA([g({ appid: 1, playtime_forever: 60, genres: [] })]);
    expect(out.find((d) => d.genre === "Unknown")).toBeUndefined();
    expect(out).toEqual([]);
  });
});
