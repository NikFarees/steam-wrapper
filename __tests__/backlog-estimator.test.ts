import { describe, it, expect } from "vitest";
import { calculateBacklog } from "@/lib/backlog-estimator";
import { MOCK_GAMES } from "@/lib/mock-data";
import type { SteamGame } from "@/lib/types";

const g = (appid: number, pt: number, name = `Game ${appid}`): SteamGame => ({
  appid, name, playtime_forever: pt, img_icon_url: "",
});

describe("calculateBacklog", () => {
  it("empty backlog when no unplayed games", () => {
    const r = calculateBacklog([g(730, 1800), g(570, 3600)]);
    expect(r.totalHours).toBe(0);
    expect(r.items).toHaveLength(0);
    expect(r.byGenre).toHaveLength(0);
  });

  it("only includes unplayed games", () => {
    const r = calculateBacklog([g(730, 1800), g(1091500, 0, "Cyberpunk 2077")]);
    expect(r.items).toHaveLength(1);
    expect(r.items[0].appid).toBe(1091500);
  });

  it("uses genre hours for known appid — 1091500 = Action RPG = 45h", () => {
    const r = calculateBacklog([g(1091500, 0, "Cyberpunk 2077")]);
    expect(r.items[0].estimatedHours).toBe(45);
    expect(r.items[0].genre).toBe("Action RPG");
  });

  it("uses deterministic fallback for unknown appid — 99999 % 7 = 4 → 45", () => {
    const r = calculateBacklog([g(99999, 0)]);
    expect(r.items[0].estimatedHours).toBe(45);
  });

  it("totalHours is sum of all item hours", () => {
    // 1091500 = 45h, 1174180 = Action Adventure = 25h
    const r = calculateBacklog([g(1091500, 0, "Cyberpunk"), g(1174180, 0, "RDR2")]);
    expect(r.totalHours).toBe(70);
  });

  it("totalDays = round(totalHours / 8)", () => {
    const r = calculateBacklog([g(1091500, 0, "Cyberpunk 2077")]); // 45h
    expect(r.totalDays).toBe(Math.round(45 / 8));
  });

  it("aggregates same-genre games in byGenre", () => {
    // Two Action RPG games: 45 + 45 = 90h
    const r = calculateBacklog([g(1091500, 0, "Cyberpunk"), g(1245620, 0, "Elden Ring")]);
    const entry = r.byGenre.find((x) => x.genre === "Action RPG");
    expect(entry?.hours).toBe(90);
  });

  it("processes all 8 unplayed from mock dataset", () => {
    const unplayed = MOCK_GAMES.filter((x) => x.playtime_forever === 0);
    expect(unplayed).toHaveLength(8);
    const r = calculateBacklog(MOCK_GAMES);
    expect(r.items).toHaveLength(8);
    expect(r.totalHours).toBeGreaterThan(0);
  });
});
