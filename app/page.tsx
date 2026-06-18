import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SteamLoginButton from "@/components/auth/SteamLoginButton";

export default async function HomePage() {
  const cookieStore = await cookies();
  if (cookieStore.get("steamId")?.value) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
          Steam Gamer Wrap-Up
        </h1>
        <p className="mt-4 max-w-md text-lg text-slate-400">
          Discover your shame score, backlog size, rarest achievements, and genre DNA.
        </p>
      </div>
      <SteamLoginButton />
      <p className="text-xs text-slate-600">Demo mode: no real Steam account needed.</p>
    </main>
  );
}
