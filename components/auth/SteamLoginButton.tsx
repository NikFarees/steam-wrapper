"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SteamLoginButton() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/steam-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (res.ok && data.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error ?? "Could not find that Steam account");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col items-center gap-3 w-full max-w-sm">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Custom URL, Steam64 ID, or profile link"
        disabled={loading}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-[#66c0f4] focus:ring-1 focus:ring-[#66c0f4] transition-colors disabled:opacity-50"
      />
      {error && (
        <div className="w-full text-center">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-xs text-slate-500 mt-1">
            No custom URL? Paste your full profile link: steamcommunity.com/profiles/76561198...
          </p>
        </div>
      )}
      <Button
        type="submit"
        disabled={loading || !username.trim()}
        size="lg"
        className="w-full bg-[#66c0f4] text-[#0e1a26] font-semibold hover:bg-[#4fa8e0] transition-colors disabled:opacity-60 gap-2"
      >
        <Search className="h-4 w-4" />
        {loading ? "Looking up..." : "View stats"}
      </Button>
    </form>
  );
}
