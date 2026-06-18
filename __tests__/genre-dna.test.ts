import { describe, it, expect } from "vitest";
import { buildGenreDNA } from "@/lib/genre-dna";
import { MOCK_GAMES } from "@/lib/mock-data";
import type { SteamGame } from "@/lib/types";

const g = (appid: number, pt: number): SteamGame => ({
  appid, name: `Game ${appid}`, playtime_forever: pt, img_icon_url: "",
});

describe("buildGenreDNA", () => {
  it("returns empty array for no games", () => {
    expect(buildGenreDNA([])).toHaveLength(0);
  });

  it("excludes unplayed games", () => {
    expect(buildGenreDNA([g(730, 0), g(570, 0)])).toHaveLength(0);
  });

  it("converts minutes to hours", () => {
    const r = buildGenreDNA([g(730, 120)]); // 120 min = 2h
    expect(r[0].playtimeHours).toBe(2);
  });

  it("aggregates same-genre games", () => {
    // 730 (FPS, 300min=5h) + 1938090 (FPS, 300min=5h) = 10h FPS
    const r = buildGenreDNA([g(730, 300), g(1938090, 300)]);
    expect(r.find((x) => x.genre === "FPS")?.playtimeHours).toBe(10);
  });

  it("returns at most 8 genres", () => {
    const games = [
      g(730, 600), g(570, 600), g(1245620, 600), g(1174180, 600),
      g(2050650, 600), g(252490, 600), g(105600, 600), g(413150, 600),
      g(1054340, 600), g(1551360, 600),
    ];
    expect(buildGenreDNA(games).length).toBeLessThanOrEqual(8);
  });

  it("sorts by playtime descending", () => {
    const r = buildGenreDNA([g(570, 6000), g(730, 1200)]);
    expect(r[0].genre).toBe("MOBA");
    expect(r[0].playtimeHours).toBeGreaterThan(r[1].playtimeHours);
  });

  it("fullMark = ceiling of max hours to nearest 100", () => {
    const r = buildGenreDNA([g(570, 36000)]); // 600h
    expect(r[0].fullMark).toBe(600);
  });

  it("MOBA is dominant genre in mock dataset (Dota 2 = 600h)", () => {
    const r = buildGenreDNA(MOCK_GAMES);
    expect(r[0].genre).toBe("MOBA");
    expect(r[0].playtimeHours).toBe(600);
  });
});
