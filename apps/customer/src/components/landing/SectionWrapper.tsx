"use client";
import { ReactNode } from "react";

export default function SectionWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={`relative mx-6 md:mx-24 my-10 p-8 md:p-12 rounded-[40px] bg-black/5 backdrop-blur-xl border border-white/20 shadow-2xl ${className ?? ''}`}>
      {children}
    </section>
  );
}