"use client";
import { motion, AnimatePresence } from "@repo/ui/motion";
import { X, Plus, Minus } from "@repo/ui/icons";
import { useCartStore } from "@repo/store";
import { useEffect } from "react";

export default function CartOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, addItem, removeItem, setQuantity, total } = useCartStore();
  useEffect(() => {
    if (open && items.length === 0) {
      addItem({ id: "dish-001", name: "Traditional Sushi", price: 85000, imageUrl: "https://images.unsplash.com/photo-1540317584754-5079b12b2743?w=400&q=60", restaurantId: "rest-002", quantity: 1 });
      addItem({ id: "dish-002", name: "Prawn Cocktail", price: 65000, imageUrl: "https://images.unsplash.com/photo-1604908176997-88661f2a2c7e?w=400&q=60", restaurantId: "rest-002", quantity: 1 });
      addItem({ id: "dish-003", name: "Seaweed Salad", price: 45000, imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=60", restaurantId: "rest-002", quantity: 1 });
    }
  }, [open, items.length, addItem]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            layoutId="cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 150, damping: 18 }}
            className="fixed z-[70] right-6 top-20 w-[420px] max-w-[92vw] rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 text-white">
              <div className="font-semibold">Giỏ hàng</div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-6 text-white/80">Chưa có món nào</div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {items.map((it) => (
                    <li key={it.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
                          {it.imageUrl ? (
                            <img
                              src={it.imageUrl}
                              alt={it.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-white/60 text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">
                            {it.name}
                          </div>
                          <div className="text-white/80 text-sm">
                            {(it.price * it.quantity).toLocaleString("vi-VN")} đ
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeItem(it.id)}
                            className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            value={it.quantity}
                            onChange={(e) =>
                              setQuantity(
                                it.id,
                                Math.max(1, parseInt(e.target.value || "1", 10))
                              )
                            }
                            className="w-10 h-8 rounded-lg bg-white/5 border border-white/20 text-center text-white"
                          />
                          <button
                            onClick={() =>
                              addItem({
                                id: it.id,
                                name: it.name,
                                price: it.price,
                                imageUrl: it.imageUrl,
                                restaurantId: it.restaurantId,
                                quantity: 1,
                              })
                            }
                            className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-white">
              <div className="text-sm">Tổng</div>
              <div className="text-lg font-semibold">
                {total().toLocaleString("vi-VN")} đ
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}