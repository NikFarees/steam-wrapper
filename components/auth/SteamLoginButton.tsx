"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SteamLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/steam-mock", { method: "POST" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={loading}
      size="lg"
      className="bg-[#66c0f4] text-[#0e1a26] font-bold hover:bg-[#4fa8e0] transition-colors disabled:opacity-60"
    >
      {loading ? "Connecting..." : "Login with Steam (Mock)"}
    </Button>
  );
}
