import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function resolveToSteamId(input: string): Promise<string | null> {
  const trimmed = input.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Already a 64-bit Steam ID
  if (/^\d{17}$/.test(trimmed)) return trimmed;

  // Full numeric profile URL: steamcommunity.com/profiles/76561198...
  const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/);
  if (profileMatch) return profileMatch[1];

  // Custom vanity URL: steamcommunity.com/id/customname or just customname
  const vanity = trimmed.replace(/^steamcommunity\.com\/id\//, "");

  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("vanityurl", vanity);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = await res.json() as { response: { success: number; steamid?: string } };
  if (data.response.success !== 1 || !data.response.steamid) return null;
  return data.response.steamid;
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => ({})) as { username?: string };
  const username = body.username?.trim();

  if (!username) {
    return NextResponse.json({ ok: false, error: "Username required" }, { status: 400 });
  }

  const steamId = await resolveToSteamId(username);
  if (!steamId) {
    return NextResponse.json({ ok: false, error: "Steam username not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set("steamId", steamId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return NextResponse.json({ ok: true, steamId });
}

export async function DELETE(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete("steamId");
  return NextResponse.json({ ok: true });
}
