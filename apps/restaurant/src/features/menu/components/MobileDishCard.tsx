'use client';

import { motion } from "@repo/ui/motion";
import { Trash2, Edit2, ChefHat, Plus, Minus, Package } from "@repo/ui/icons";
import { ImageWithFallback } from "@repo/ui";
import { formatVnd } from "@repo/lib";
import { Dish } from "@repo/types";

interface MobileDishCardProps {
  dish: Dish;
  onEdit: (dish: Dish) => void;
  onDelete: (e: React.MouseEvent, dishId: string) => void;
  onUpdateStock: (delta: number) => void;
}

export default function MobileDishCard({
  dish,
  onEdit,
  onDelete,
  onUpdateStock
}: MobileDishCardProps) {
  const isOutOfStock = !dish.isAvailable || (dish.availableQuantity ?? 0) <= 0;

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.98 }}
      className={`group relative w-full h-[140px] ${isOutOfStock ? 'cursor-default transition-opacity opacity-95' : 'cursor-pointer transition-all duration-500'}`}
      onClick={() => onEdit(dish)}
    >
      {/* Background & Shadow Container with Clipping */}
      <div className={`absolute inset-0 flex flex-row overflow-hidden rounded-[40px] transition-all duration-500 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.08)] md:shadow-[0_0_25px_rgba(0,0,0,0.10)] ${!isOutOfStock ? "hover:bg-gray-50/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]" : ""}`}>
        {/* Visual Identity Section (Left) */}
        <div className="relative w-36 md:w-32 h-full flex-shrink-0 overflow-hidden">
          <ImageWithFallback
            src={dish.imageUrl}
            alt={dish.name}
            fill
            placeholderMode="horizontal"
            className={`object-cover transition-transform duration-700 ease-out ${isOutOfStock ? 'grayscale brightness-75' : 'group-hover:scale-110'}`}
            sizes="144px"
          />
          <div className={`absolute inset-0 transition-all duration-700 ease-out ${isOutOfStock ? 'bg-primary/10 mix-blend-color' : 'bg-black/5 group-hover:bg-black/0'}`} />

          {/* Counter Badge overlay on Left Image */}
          {!isOutOfStock && (
            <div className="absolute bottom-3 right-3 z-10">
              <div className="flex items-center gap-1 bg-black/30 text-white/80 text-[10px] font-semibold backdrop-blur-sm px-2 py-1 rounded-xl shadow-lg border border-white/5">
                <div className="rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <Package className="w-3 h-3" strokeWidth={2.5} />
                </div>
                <span className="pt-0.5">
                  Quantity: {dish.availableQuantity}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info Section (Right) */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0 relative">
          <div className="space-y-0.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 text-gray-400">
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Dish</span>
              </div>
              <h4 className={`font-bold text-gray-700 text-base md:text-lg truncate leading-tight tracking-tight ${isOutOfStock ? 'opacity-60' : ''}`}>
                {dish.name || 'Món mới'}
              </h4>
            </div>

            <p className="text-[10px] text-gray-400 font-medium line-clamp-1 italic opacity-60">
              {dish.description || 'Chưa có mô tả'}
            </p>
          </div>

          <div className="flex flex-col border-t border-gray-50 pt-2.5">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] leading-none mb-1 opacity-50">Price</span>
            <div className={`text-xl md:text-xl font-anton font-semibold text-gray-700 leading-none tracking-tight ${isOutOfStock ? 'opacity-60' : ''}`}>
              {formatVnd(Number(dish.price))}
            </div>
          </div>
        </div>
      </div>

      {/* Out of Stock Ribbon - Styled like Closed Ribbon */}
      {isOutOfStock && (
        <motion.div
          initial={{ x: -25, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-6 left-[-8px] z-20 pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-red-600 text-white pl-4 pr-5 py-2 rounded-r-2xl shadow-xl border-y border-r border-white/20">
            <Package size={14} strokeWidth={3} />
            <span className="text-[12px] font-black font-anton uppercase tracking-widest pt-0.5">HẾT HÀNG</span>
          </div>
          <div className="absolute left-[1px] -bottom-2 w-0 h-0 border-t-[8px] border-t-red-900 border-l-[8px] border-l-transparent" />
        </motion.div>
      )}

      {/* Floating Action Buttons (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-10 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#F3F4F6", color: "#374151" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(dish)}
          className="w-9 h-9 rounded-2xl bg-gray-100/80 flex items-center justify-center text-gray-400 shadow-sm transition-colors"
          title="Chỉnh sửa"
        >
          <Edit2 className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#FEF2F2", color: "#EF4444" }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => onDelete(e, dish.id)}
          className="w-9 h-9 rounded-2xl bg-gray-100/80 flex items-center justify-center text-gray-400 shadow-sm transition-colors"
          title="Xóa món"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
