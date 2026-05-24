'use client';

import { motion } from '@repo/ui/motion';
import { Clock, MapPin, User, CheckCircle2, XCircle, CreditCard } from '@repo/ui/icons';
import { formatVnd } from '@repo/lib';
import { OrderHistoryItem } from '@repo/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface MobileHistoryCardProps {
  order: OrderHistoryItem;
  onClick: () => void;
}

export default function MobileHistoryCard({ order, onClick }: MobileHistoryCardProps) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const datetime = order.createdAt
    ? format(new Date(order.createdAt), 'dd/MM/yy HH:mm', { locale: vi })
    : '--/--/-- --:--';

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

  const itemNames = order.items.map(item => `${item.quantity}x ${item.name}`).join(", ");

  const isCompleted = order.status.toUpperCase() === 'COMPLETED' || order.status.toUpperCase() === 'DELIVERED';
  const isCancelled = order.status.toUpperCase() === 'CANCELLED' || order.status.toUpperCase() === 'REJECTED';

  const shortCode = order.id.replace('ORD-', '#');

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative w-full cursor-pointer"
    >
      <div className="relative flex flex-col p-4 overflow-hidden rounded-[36px] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-50/50">

        {/* Header: Customer Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
              {order.customerAvatar ? (
                <img src={order.customerAvatar} alt={order.customerName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none block mb-1">Customer</span>
              <h4 className="font-extrabold text-[#1A1A1A] text-sm truncate leading-tight tracking-tight">
                {order.customerName}
              </h4>
            </div>
          </div>

          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter self-start mt-1 flex flex-col items-end shrink-0">
            <span>{shortCode}</span>
            <span className="text-[8px] text-gray-300 mt-0.5">
              {order.paymentMethod} • {timeOnly}
            </span>
          </div>
        </div>

        {/* Middle: Delivery Point */}
        <div className="flex items-center gap-2 px-0 mb-3 pr-4">
          <div className="w-6 h-6 rounded-full bg-lime-50 flex items-center justify-center shrink-0">
            <MapPin className="w-3 h-3 text-lime-500" />
          </div>
          <p className="text-[12px] font-bold text-gray-600 line-clamp-1 opacity-60">
            {cleanAddress(order.deliveryAddress)}
          </p>
        </div>

        {/* Footer: Items Summary & Total */}
        <div className="flex items-end justify-between pt-2 border-t border-gray-100/60">
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
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none block mb-1 opacity-50">Net Earnings</span>
            <div className={`text-lg font-anton font-semibold ${isCompleted ? 'text-primary' : 'text-gray-500'} leading-none tracking-tight`}>
              {isCompleted ? formatVnd(order.netIncome) : formatVnd(order.totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Status Ribbon - Top Right Corner */}
      {isCancelled && (
        <div className="absolute top-12 right-[-9px] z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-red-600 text-white pl-3 pr-4 py-1 rounded-l-2xl shadow-md border-y border-r border-white/20">
            <XCircle size={10} strokeWidth={3} />
            <span className="text-[9px] font-black font-anton uppercase tracking-wider pt-0.5">CANCEL</span>
          </div>
          <div className="absolute right-[0px] -bottom-2 w-0 h-0 border-t-[8px] border-t-red-700 opacity-60 border-r-[8px] border-r-transparent" />
        </div>
      )}
    </motion.div>
  );
}
