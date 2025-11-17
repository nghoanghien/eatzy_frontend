"use client";

export default function FloatingDecor() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-700">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-lime-100"></div>

      <div className="absolute right-1/4 top-1/5 w-28 h-28 md:w-40 md:h-40 bg-[var(--secondary)]/40 rounded-full blur-md animate-float-slow"></div>
      <div className="absolute left-1/5 top-1/3 w-24 h-24 md:w-36 md:h-36 bg-[var(--primary)]/30 rounded-full blur-md animate-float-slow-reverse"></div>

      <div className="absolute inset-0">
        <div className="absolute left-[8%] bottom-[20%] w-64 h-32 bg-white/70 rounded-full blur-md animate-float-random-1"></div>
        <div className="absolute left-[22%] bottom-[32%] w-72 h-40 bg-white/70 rounded-full blur-md animate-float-random-2"></div>
        <div className="absolute right-[28%] bottom-[24%] w-80 h-36 bg-white/70 rounded-full blur-md animate-float-random-3"></div>
        <div className="absolute right-[12%] bottom-[38%] w-64 h-32 bg-white/70 rounded-full blur-md animate-float-random-4"></div>

        <div className="absolute left-[6%] bottom-[85%] w-48 h-28 bg-[var(--primary)]/25 rounded-full blur-md animate-float-random-1"></div>
        <div className="absolute right-[14%] bottom-[12%] w-56 h-32 bg-[var(--secondary)]/25 rounded-full blur-md animate-float-random-2"></div>
        <div className="absolute left-[28%] bottom-[46%] w-40 h-24 bg-[var(--primary)]/25 rounded-full blur-md animate-float-random-3"></div>
      </div>
    </div>
  );
}