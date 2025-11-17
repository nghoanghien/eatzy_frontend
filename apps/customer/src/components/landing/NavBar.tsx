"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui";

export default function Navbar({ onHome, onCategories, onRestaurants, onHowItWorks }: { onHome: () => void; onCategories: () => void; onRestaurants: () => void; onHowItWorks: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-[60%] flex items-center justify-between px-4 py-2 rounded-full backdrop-blur-xl bg-white/30 border border-white/50 shadow-xl">
      <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-[var(--primary)]/50">
        <div className="relative w-7 h-7 rotate-45 rounded-md">
          <div className="absolute inset-0 rounded-md bg-[var(--primary)]"></div>
          <div className="absolute inset-[3px] rounded-md bg-gradient-to-br from-white/80 to-white/60"></div>
          <div className="absolute inset-[6px] rounded-md bg-white"></div>
          <svg className="absolute inset-0 m-auto w-5 h-5 -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1v22"></path>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div className="text-lg font-semibold text-[var(--primary)]">Eatzy</div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <button onClick={onHome} className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]">Trang Chủ</button>
        <button onClick={onCategories} className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]">Danh Mục</button>
        <button onClick={onRestaurants} className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]">Nhà Hàng</button>
        <button onClick={onHowItWorks} className="text-sm font-medium text-gray-700 hover:text-[var(--primary)]">Cách Hoạt Động</button>
      </div>

      <div className="hidden md:flex items-center">
        <Link href="/login">
          <Button variant="primary" size="md" className="rounded-full">Đăng nhập</Button>
        </Link>
      </div>

      <div className="md:hidden">
        <button onClick={() => setOpen((v) => !v)} className="p-2 rounded-full hover:bg-white/60">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-white">
          <div className="flex justify-end p-4">
            <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="flex flex-col items-center gap-6 p-8">
            <button onClick={() => { setOpen(false); onHome(); }} className="text-lg font-medium">Trang Chủ</button>
            <button onClick={() => { setOpen(false); onCategories(); }} className="text-lg font-medium">Danh Mục</button>
            <button onClick={() => { setOpen(false); onRestaurants(); }} className="text-lg font-medium">Nhà Hàng</button>
            <button onClick={() => { setOpen(false); onHowItWorks(); }} className="text-lg font-medium">Cách Hoạt Động</button>
            <Link href="/login" className="w-full">
              <Button variant="primary" size="lg" className="w-full rounded-full">Đăng nhập</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}