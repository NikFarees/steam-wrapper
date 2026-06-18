import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Steam Gamer Wrap-Up",
  description: "Visualize your Steam gaming stats: shame score, backlog, rarity achievements, and genre DNA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-[#0e1a26]">{children}</body>
    </html>
  );
}
