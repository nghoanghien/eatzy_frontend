'use client';

import { motion } from '@repo/ui/motion';
import { Clock, MapPin, Package, User } from '@repo/ui/icons';
import { formatVnd } from '@repo/lib';
import type { Order } from '@repo/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const datetime = order.createdAt
    ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })
    : '--/--/---- --:--';

  const timeOnly = order.createdAt
    ? format(new Date(order.createdAt), 'HH:mm')
    : '--:--';

  const cleanAddress = (addr?: string) => {
    if (!addr) return "";
    return addr
      .replace(/,\s*\d{5}\s*(?=,|$)/g, "") // Remove zip code with preceding comma
      .replace(/\b\d{5}\b\s*,?\s*/g, "")    // Remove standalone zip code
      .replace(/,\s*,/g, ",")              // Fix double commas
      .trim()
      .replace(/^,|,$/g, "");              // Trim leading/trailing commas
  };

  const itemNames = order.items.map(item => item.name).join(", ");

  return (
    <>
      {/* Mobile View Card (Driver History Card Design style, in English) */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="md:hidden group relative w-full cursor-pointer"
      >
        <div className="relative flex flex-col p-4 overflow-hidden rounded-[36px] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-50">

          {/* Header: Customer Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-colors duration-300">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none block mb-1">Customer</span>
                <h4 className="font-extrabold text-[#1A1A1A] text-sm truncate leading-tight tracking-tight">
                  {order.customer?.name || "Guest User"}
                </h4>
              </div>
            </div>

            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter self-start mt-1 flex flex-col items-end">
              <span>{order.code}</span>
              <span className="text-[8px] text-gray-300 mt-0.5">{timeOnly}</span>
            </div>
          </div>

          {/* Middle: Delivery Point */}
          <div className="flex items-center gap-2 px-0 mb-3">
            <div className="w-6 h-6 rounded-full bg-lime-50 flex items-center justify-center shrink-0">
              <MapPin className="w-3 h-3 text-lime-500" />
            </div>
            <p className="text-[12px] font-bold text-gray-600 line-clamp-1 opacity-60">
              {cleanAddress(order.deliveryLocation?.address)}
            </p>
          </div>

          {/* Footer: Items Summary & Total */}
          <div className="flex items-end justify-between pt-1 border-t border-gray-100/60">
            <div className="min-w-0 max-w-[60%]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none opacity-50">Items</span>
                <span className="text-[8px] font-black bg-gray-400 text-white px-1.5 py-0.5 rounded-md tracking-tight">
                  {totalItems} items
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium line-clamp-1 italic opacity-60">
                {itemNames}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none block mb-1 opacity-50">Total</span>
              <div className="text-xl font-anton font-semibold text-[var(--primary)] leading-none tracking-tight">
                {formatVnd(order.total)}
              </div>
            </div>
          </div>
        </div>

        {/* Driver Assigned Ribbon */}
        {order.driverLocation?.name && (
          <div className="absolute top-10 right-[-9px] z-20 pointer-events-none">
            <div className="flex items-center gap-1 bg-blue-500 text-white pl-3 pr-4 py-1.5 rounded-l-2xl shadow-lg border-y border-r border-white/20">
              <Package size={12} strokeWidth={3} />
              <span className="text-[10px] font-black font-anton uppercase tracking-widest pt-0.5">ASSIGNED</span>
            </div>
            <div className="absolute right-[0px] -bottom-2 w-0 h-0 border-t-[8px] border-t-blue-700 opacity-60 border-r-[8px] border-r-transparent" />
          </div>
        )}
      </motion.div>

      {/* Desktop View Card (Original) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="hidden md:block bg-white rounded-[40px] p-5 transition-all duration-300 cursor-pointer shadow-md border-4 border-gray-100 hover:border-[var(--primary)]/40 hover:bg-gray-50/30"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</h4>
            <div className="text-lg font-anton font-bold text-[#1A1A1A] mt-0.5">
              {order.code}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {order.driverLocation.name && (
              <span className="text-[10px] font-anton font-bold bg-blue-500 text-white px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3 h-3" />
                Driver Assigned
              </span>
            )}
            <span className="text-xs font-bold bg-lime-500 text-white px-2.5 py-1 rounded-lg">
              {totalItems} items
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</h4>
            <div className="font-bold text-[#1A1A1A] text-sm truncate">
              {order.customer?.name || 'Customer'}
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full mb-4" />

        {/* Address */}
        <div className="mb-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Delivery Address</div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" strokeWidth={2.4} />
            <div className="font-bold text-gray-700 text-base line-clamp-2">
              {order.deliveryLocation.address || 'Delivery Address'}
            </div>
          </div>
        </div>

        {/* Items Preview */}
        <div className="bg-gray-50/70 rounded-2xl p-3 mb-4">
          <div className="space-y-2">
            {order.items.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-100 text-[#1A1A1A] font-anton text-sm flex items-center justify-center shadow-sm">
                  {item.quantity}x
                </div>
                <span className="font-bold text-gray-600 text-sm line-clamp-1 flex-1">{item.name}</span>
              </div>
            ))}
            {order.items.length > 2 && (
              <div className="text-xs text-gray-400 font-medium pl-10">
                +{order.items.length - 2} more items...
              </div>
            )}
          </div>
        </div>

        {/* Time & Price Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium" suppressHydrationWarning>
            <Clock className="w-3.5 h-3.5" />
            <span>{datetime}</span>
          </div>
          <span className="font-anton text-xl font-semibold text-[var(--primary)]">
            {formatVnd(order.total)}
          </span>
        </div>
      </motion.div>
    </>
  );
}
