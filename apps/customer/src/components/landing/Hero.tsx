"use client";

import Link from "next/link";
import { Button } from "@repo/ui";

export default function Hero() {
  return (
    <main className="relative z-10 flex flex-col items-center justify-center px-6 py-20 md:py-16 text-center">
      <div className="mb-4 text-lg text-[var(--primary)]">
        Trải nghiệm đặt món nhanh cùng <span className="font-bold">Eatzy</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 max-w-4xl leading-tight">
        Ăn Ngon Mỗi Ngày
        <br />
        <span className="text-[var(--primary)]">Đặt Nhanh, Giao Tốc Độ</span>
      </h1>

      <p className="text-lg text-gray-600 max-w-2xl mb-10">
        Khám phá nhà hàng yêu thích, săn ưu đãi hấp dẫn và theo dõi đơn hàng thời gian thực. Tất cả trong một trải nghiệm mượt mà.
      </p>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <Link href="/booking">
          <Button variant="primary" size="lg" className="rounded-full px-8">Bắt đầu đặt món</Button>
        </Link>
        <Link href="/login">
          <Button variant="glass" size="lg" className="rounded-full px-8 text-gray-800">Đăng nhập</Button>
        </Link>
      </div>
    </main>
  );
}