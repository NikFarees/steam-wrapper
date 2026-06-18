import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — Steam Gamer Wrap-Up",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("steamId")?.value) redirect("/");
  return <DashboardClient />;
}
