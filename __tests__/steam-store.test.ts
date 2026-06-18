import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchGameMeta } from "@/lib/steam-store";

function appdetailsResponse(appid: number, body: unknown) {
  return { [appid]: { success: true, data: body } };
}

describe("fetchGameMeta", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("returns empty object for empty input", async () => {
    expect(await fetchGameMeta([])).toEqual({});
  });

  it("parses genres and price for a paid game", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify(appdetailsResponse(10, {
        is_free: false,
        genres: [{ id: "1", description: "Action" }, { id: "37", description: "Free to Play" }],
        price_overview: { final: 1999 },
      })))
    ));
    const out = await fetchGameMeta([10]);
    expect(out[10].genres).toEqual(["Action", "Free to Play"]);
    expect(out[10].priceCents).toBe(1999);
    expect(out[10].isFree).toBe(false);
  });

  it("treats free games as price 0", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify(appdetailsResponse(20, {
        is_free: true, genres: [{ id: "1", description: "RPG" }],
      })))
    ));
    const out = await fetchGameMeta([20]);
    expect(out[20].priceCents).toBe(0);
    expect(out[20].isFree).toBe(true);
  });

  it("swallows per-game failure without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    const out = await fetchGameMeta([30]);
    expect(out).toEqual({}); // failed game simply absent
  });
});
