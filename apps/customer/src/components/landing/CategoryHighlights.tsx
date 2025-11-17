"use client";

import { useEffect, useState } from "react";
import SectionWrapper from "./SectionWrapper";

type Cat = { title: string; color: string; icon: JSX.Element; bg: string };

const IconBurger = (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="7" width="16" height="4" rx="2" fill="currentColor" opacity="0.2"/>
    <rect x="5" y="12" width="14" height="3" rx="1.5" fill="currentColor"/>
    <rect x="6" y="16" width="12" height="2" rx="1" fill="currentColor"/>
  </svg>
);

const IconPizza = (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 21l9-18 9 18H3z" fill="currentColor" opacity="0.2"/>
    <circle cx="12" cy="14" r="1.6" fill="currentColor"/>
    <circle cx="9" cy="11" r="1.2" fill="currentColor"/>
    <circle cx="15" cy="11" r="1.2" fill="currentColor"/>
  </svg>
);

const IconSushi = (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="8" width="16" height="8" rx="2" fill="currentColor" opacity="0.2"/>
    <rect x="6" y="10" width="12" height="4" rx="2" fill="currentColor"/>
  </svg>
);

const IconCoffee = (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" fill="currentColor" opacity="0.2"/>
    <path d="M16 9h3a2 2 0 0 1 0 4h-3" stroke="currentColor"/>
  </svg>
);

export default function CategoryHighlights() {
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const handle = () => setParallax(Math.min(30, window.scrollY * 0.03));
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const cats: Cat[] = [
    { title: "Burger", color: "text-emerald-700", icon: IconBurger, bg: "bg-emerald-100" },
    { title: "Pizza", color: "text-lime-700", icon: IconPizza, bg: "bg-lime-100" },
    { title: "Sushi", color: "text-teal-700", icon: IconSushi, bg: "bg-teal-100" },
    { title: "Cà phê", color: "text-orange-700", icon: IconCoffee, bg: "bg-orange-100" },
  ];

  return (
    <SectionWrapper>
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Danh mục nổi bật</h2>
        <p className="text-gray-600">Khám phá món yêu thích theo chủ đề</p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {cats.map((c, i) => (
          <div key={c.title} className="col-span-12 sm:col-span-6 md:col-span-3">
            <div
              className={`relative ${c.bg} rounded-3xl p-6 shadow-lg overflow-hidden group transition-all duration-500`}
              style={{ transform: `translateY(-${parallax * (0.02 + i * 0.006)}px)` }}
            >
              <div className="absolute inset-0 rounded-3xl border border-white/40 bg-white/20 backdrop-blur-sm"></div>
              <div className="relative z-10 flex flex-col items-start gap-3">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${c.color}`}>{c.icon}</div>
                <div className="text-lg font-semibold text-gray-800">{c.title}</div>
                <div className="text-sm text-gray-600">Nhiều quán ngon, giao nhanh</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}