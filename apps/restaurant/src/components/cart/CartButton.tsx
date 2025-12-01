"use client";
import React from "react";
import { ShoppingCart } from "@repo/ui/icons";
import { useCartStore } from "@repo/store";
import { useCartUI } from "@/context/CartUIContext";

export default function CartButton() {
  const count = useCartStore((s) => s.items.length);
  const total = useCartStore((s) => s.total());
  const { openCart } = useCartUI();

  return (
    <button
      onClick={openCart}
      aria-label="Giỏ hàng"
      className="fixed right-6 bottom-6 z-50 bg-primary text-white rounded-full shadow-lg p-3 flex items-center gap-3 hover:scale-105 transition-transform"
    >
      <ShoppingCart size={18} />
      <div className="hidden sm:flex flex-col items-start text-left text-xs leading-tight">
        <div className="font-semibold">Giỏ hàng</div>
        <div className="text-[11px] opacity-90">{count} món — {total.toLocaleString()} đ</div>
      </div>
      {count > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center">{count}</div>}
    </button>
  );
}
