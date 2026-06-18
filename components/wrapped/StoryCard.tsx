"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function StoryCard({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className="flex min-h-screen snap-start items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full max-w-2xl text-center ${className}`}
      >
        {children}
      </motion.div>
    </section>
  );
}
