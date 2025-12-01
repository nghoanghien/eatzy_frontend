"use client";
import React from "react";
import { useCartStore } from "@repo/store";
import { X, Trash2, MapPin } from "@repo/ui/icons";
import { useCartUI } from "@/context/CartUIContext";
import { Button } from "@repo/ui";

export default function CartOverlay() {
  const { open, closeCart } = useCartUI();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const { removeItem, setQuantity, clearCart } = useCartStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeCart} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white dark:bg-neutral-900 p-6 shadow-lg overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Giỏ hàng</div>
          <button onClick={closeCart} aria-label="Đóng" className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Giỏ hàng trống</div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 p-2 border rounded">
                <img src={it.imageUrl ?? ''} alt={it.name} className="w-16 h-12 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm text-gray-600">{(it.price).toLocaleString()} đ</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(it.id, Math.max(1, it.quantity - 1))} className="px-2 py-1 border rounded">-</button>
                  <div className="px-2">{it.quantity}</div>
                  <button onClick={() => setQuantity(it.id, it.quantity + 1)} className="px-2 py-1 border rounded">+</button>
                </div>
                <button onClick={() => removeItem(it.id)} className="p-2 ml-2 rounded hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}

            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-2 text-sm text-gray-600"><div>Tạm tính</div><div>{total.toLocaleString()} đ</div></div>
              <div className="mb-4">
                <label className="block text-sm mb-2">Địa chỉ giao hàng <span className="text-xs text-gray-400">(fake)</span></label>
                <div className="flex gap-2"><input placeholder="Số nhà, đường..." className="flex-1 border p-2 rounded" /> <button className="p-2 border rounded"><MapPin size={16} /></button></div>
              </div>
              <div className="mb-4">
                <div className="text-sm mb-2">Thanh toán</div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2"><input type="radio" name="payment" defaultChecked /> <span>Tiền mặt</span></label>
                  <label className="flex items-center gap-2"><input type="radio" name="payment" /> <span>Thẻ</span></label>
                  <label className="flex items-center gap-2"><input type="radio" name="payment" /> <span>Ví điện tử</span></label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="primary" size="md" className="flex-1" onClick={() => { console.log('Checkout', items); clearCart(); closeCart(); }}>Thanh toán</Button>
                <Button variant="ghost" size="md" onClick={() => { clearCart(); }}>Xóa</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
