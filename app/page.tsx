import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SteamLoginButton from "@/components/auth/SteamLoginButton";

export default async function HomePage() {
  const cookieStore = await cookies();
  if (cookieStore.get("steamId")?.value) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
          Steam Wrap-Up
        </h1>
        <p className="mt-4 text-base text-slate-400 leading-relaxed">
          See how many games you have actually played, how long your backlog would take to finish, and which genres you spend most time in.
        </p>
      </div>
      <SteamLoginButton />
      <p className="text-xs text-slate-600">Public profiles only. No password needed.</p>
    </main>
  );
}
