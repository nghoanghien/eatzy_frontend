"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@repo/ui/motion";
import { X, CheckCircle, XCircle, MapPin, User, ChevronRight, Loader2, Bike, Package, Ticket } from "@repo/ui/icons";
import { formatVnd } from "@repo/lib";
import type { Order, OrderItem } from "@repo/types";
import { useSwipeConfirmation } from "@repo/ui";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRestaurantCommission } from "@/features/store";
import { useMobileBackHandler } from "@/hooks/useMobileBackHandler";

interface MobileOrderDrawerProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string) => void;
  onReject: (orderId: string, reason: string) => void;
  onComplete: (orderId: string) => void;
  loading?: boolean;
}

const REJECTION_REASONS = [
  "Out of stock",
  "Restaurant overloaded",
  "Cannot contact customer",
  "Delivery address too far",
  "Item unavailable",
  "Other reasons"
];

export default function MobileOrderDrawer({
  open,
  order,
  onClose,
  onConfirm,
  onReject,
  onComplete,
  loading = false,
}: MobileOrderDrawerProps) {
  const { confirm } = useSwipeConfirmation();
  const [showRejectReasons, setShowRejectReasons] = useState(false);
  const { commissionRate } = useRestaurantCommission();

  // Close drawer when user presses back button on mobile
  useMobileBackHandler(open, onClose);

  if (!order) return null;

  const systemCommission = order.subtotal * (commissionRate / 100);
  const netProfit = order.subtotal - systemCommission;

  const handleConfirmOrder = () => {
    onConfirm(order.id);
  };

  const handleRejectOrder = () => {
    setShowRejectReasons(true);
  };

  const handleSelectReason = (reason: string) => {
    confirm({
      title: "Reject order",
      description: `Are you sure you want to reject this order for: "${reason}"?`,
      confirmText: "Reject",
      onConfirm: () => {
        onReject(order.id, reason);
        setShowRejectReasons(false);
      }
    });
  };

  const handleCompleteOrder = () => {
    onComplete(order.id);
  };

  const handleCancelReject = () => {
    setShowRejectReasons(false);
  };

  const isPending = order.status === "PLACED" || order.status === "PENDING";
  const isPrepared = order.status === "PREPARED";
  const hasFooter = isPending || isPrepared || showRejectReasons;

  const datetime = order.createdAt
    ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })
    : "";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 18, stiffness: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#F8F9FA] rounded-t-[40px] overflow-hidden max-h-[92vh] flex flex-col shadow-2xl border-t border-white/20 md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold font-anton text-[#1A1A1A]">ORDER DETAILS</h2>
                <div className="text-gray-500 text-xs font-semibold mt-0.5 flex items-center gap-2">
                  <span>Order ID: #{order.code}</span>
                  <span className="opacity-30">•</span>
                  <span suppressHydrationWarning>{datetime}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className={`flex-1 overflow-y-auto no-scrollbar p-4 px-3 space-y-4 ${hasFooter ? "pb-24" : "pb-6"}`}>
              {/* Stats Row */}
              <div className="flex items-center justify-between bg-gray-900 p-5 rounded-[28px] shadow-xl shadow-black/5">
                <div className="text-center flex-1 border-r border-white/10 px-2">
                  <div className="text-[9px] text-white/40 font-semibold uppercase tracking-[0.2em] mb-1">Earning</div>
                  <div className="text-lg font-bold text-primary font-anton leading-none">
                    {formatVnd(netProfit)}
                  </div>
                </div>
                <div className="text-center flex-1 border-r border-white/10 px-2">
                  <div className="text-[9px] text-white/40 font-semibold uppercase tracking-[0.2em] mb-1">Quantity</div>
                  <div className="text-lg font-bold text-white font-anton leading-none">
                    {order.items.length} món
                  </div>
                </div>
                <div className="text-center flex-1 px-2">
                  <div className="text-[9px] text-white/40 font-semibold uppercase tracking-[0.2em] mb-1">Status</div>
                  <div className="text-sm font-bold text-white font-anton leading-none uppercase tracking-wide">
                    {order.status === "PLACED" ? "PENDING" : order.status}
                  </div>
                </div>
              </div>

              {/* Delivery Route / Customer Info */}
              <div className="rounded-[32px] p-5 shadow-sm border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black font-anton text-[#1A1A1A]">DELIVERY ROUTE</h3>
                </div>

                <div className="flex gap-4 mt-6">
                  {/* Visual Route Indicator */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-lime-100 flex items-center justify-center shadow-sm flex-shrink-0 z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div className="w-0.5 flex-grow border-l-2 border-dotted border-gray-300 my-1" />
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shadow-sm flex-shrink-0 z-10">
                      <MapPin className="w-4 h-4 text-red-500" />
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="flex-1 flex flex-col justify-between py-0.5 min-h-[110px]">
                    {/* Customer */}
                    <div>
                      <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1 flex items-center justify-between">
                        <span>Customer</span>
                      </div>
                      <div className="font-bold text-[#1A1A1A] text-sm mb-0.5 line-clamp-1">
                        {order.customer?.name || "Guest User"}
                      </div>
                      {order.customer?.phoneNumber && (
                        <div className="text-xs text-gray-500 font-medium line-clamp-1">
                          {order.customer.phoneNumber}
                        </div>
                      )}
                    </div>

                    {/* Delivery Destination */}
                    <div className="mt-4">
                      <div className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1 flex items-center justify-between">
                        <span>Điểm giao</span>
                      </div>
                      <div className="font-bold text-[#1A1A1A] text-sm mb-0.5 line-clamp-2 leading-snug">
                        {order.deliveryLocation?.address || "Address not provided"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Assigned Card */}
              {(order.driverLocation?.name || order.status === "PICKED") && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-[28px] border-2 border-blue-100 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0 border border-blue-200 shadow-sm">
                    <Bike className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">
                      {order.driverLocation?.name ? "Driver Assigned" : "Driver Status"}
                    </div>
                    <div className="font-bold text-[#1A1A1A] text-sm">
                      {order.driverLocation?.name || "Searching for driver..."}
                    </div>
                    <div className="text-[10px] text-blue-400 font-semibold mt-0.5 uppercase tracking-wider">
                      {order.driverLocation?.name ? "Active & Heading" : "Awaiting Acceptance"}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Inventory */}
              <div className="rounded-[32px] p-5 shadow-sm border-2 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                      <Package className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black font-anton text-[#1A1A1A]">ORDER INVENTORY</h3>
                  </div>
                  <span className="text-xs font-bold bg-[#1A1A1A] text-white px-3 py-1 rounded-lg">
                    {order.items.length} món
                  </span>
                </div>

                <div className="space-y-1">
                  {order.items.map((item: OrderItem) => (
                    <div key={item.id} className="group flex items-center justify-between py-3.5 rounded-[20px] transition-colors duration-200 hover:bg-gray-50/50">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-[14px] bg-gray-100 text-[#1A1A1A] font-anton font-bold text-lg flex items-center justify-center shadow-sm flex-shrink-0 transition-transform group-hover:scale-105">
                          {item.quantity}x
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#1A1A1A] text-sm transition-colors line-clamp-1 leading-tight">{item.name}</div>
                          {(item.options?.variant || (item.options?.addons && item.options.addons.length > 0)) && (
                            <div className="mt-0.5 text-[10px] text-gray-400 font-medium line-clamp-2 leading-relaxed italic">
                              {item.options?.variant && (
                                <span>{item.options.variant.name} {item.options.variant.price > 0 && `(+${formatVnd(item.options.variant.price)})`}</span>
                              )}
                              {item.options?.addons && item.options.addons.length > 0 && (
                                <span>
                                  {item.options.variant ? ", " : ""}
                                  {item.options.addons.map((a) => `${a.name} (+${formatVnd(a.price)})`).join(", ")}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-[#1A1A1A] text-sm tabular-nums ml-2 whitespace-nowrap">{formatVnd(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-gray-100 my-4" />

                <div className="space-y-3.5 px-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Tạm tính</span>
                    <span className="font-bold text-gray-900">{formatVnd(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Phí giao hàng</span>
                    <span className="font-bold text-gray-900">{formatVnd(order.fee)}</span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between items-center text-sm font-bold text-red-500">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Khuyến mãi</span>
                      </div>
                      <span>-{formatVnd(order.discount)}</span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-200/50 my-4" />

                <div className="flex justify-between items-center pt-2 px-1">
                  <span className="font-bold text-[#1A1A1A] text-base">Tổng thanh toán</span>
                  <div className="flex flex-col items-end">
                    <span className="font-anton text-[26px] text-primary leading-none whitespace-nowrap drop-shadow-sm">
                      {formatVnd(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Audit */}
              <div className="bg-[#1A1A1A] rounded-[32px] p-5 shadow-2xl shadow-black/20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary font-anton opacity-10 rounded-full blur-3xl -mr-16 -mt-16" />

                <h3 className="text-xs font-black font-anton text-white/30 mb-6 uppercase tracking-[0.3em]">PAYMENT AUDIT</h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-white/50">
                    <span className="text-xs font-bold uppercase tracking-widest">Gross Subtotal</span>
                    <span className="text-sm font-bold text-white/80">{formatVnd(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Commission Fee ({commissionRate}%)</span>
                    <span className="text-sm font-bold">-{formatVnd(systemCommission)}</span>
                  </div>

                  <div className="h-px bg-white/5 my-4" />

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Your Net Profit</span>
                      <span className="text-3xl font-bold font-anton text-white leading-none">
                        {formatVnd(netProfit)}
                      </span>
                    </div>

                    <div className="bg-primary text-black px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                      {order.status === "PLACED" ? "PENDING" : order.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* End Footer Info */}
              <div className="text-center pt-2 opacity-30">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">End of report</p>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            {hasFooter && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 rounded-t-[32px] shrink-0 z-20">
                <AnimatePresence mode="wait">
                  {!showRejectReasons ? (
                    <motion.div
                      key="action-buttons"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col gap-2.5"
                    >
                      {isPending && (
                        <>
                          <motion.button
                            whileTap={loading ? {} : { scale: 0.98 }}
                            onClick={handleConfirmOrder}
                            disabled={loading}
                            className={`w-full py-3.5 rounded-3xl font-bold text-base shadow-lg flex items-center justify-center gap-3 transition-all ${loading
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-[#1A1A1A] text-white shadow-black/10 hover:bg-black group"
                              }`}
                          >
                            {loading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <span>Confirm Order</span>
                                <div className="w-7 h-7 rounded-full bg-primary text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <CheckCircle className="w-4 h-4" strokeWidth={3} />
                                </div>
                              </>
                            )}
                          </motion.button>

                          <motion.button
                            whileTap={loading ? {} : { scale: 0.98 }}
                            onClick={handleRejectOrder}
                            disabled={loading}
                            className="w-full py-3.5 rounded-3xl bg-white border-2 border-gray-200 text-gray-500 font-bold hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                          >
                            <XCircle className="w-5 h-5" />
                            <span>Reject Order</span>
                          </motion.button>
                        </>
                      )}

                      {isPrepared && (
                        <motion.button
                          whileTap={loading ? {} : { scale: 0.98 }}
                          onClick={handleCompleteOrder}
                          disabled={loading}
                          className={`w-full py-3.5 rounded-3xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3 ${loading
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-lime-500 text-white shadow-lime-500/30 hover:bg-lime-600"
                            }`}
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <span>Mark as Ready</span>
                              <CheckCircle className="w-5 h-5" />
                            </>
                          )}
                        </motion.button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="reasons-list"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-3xl border border-gray-100"
                    >
                      <div className="flex items-center justify-between p-3 border-b border-gray-50">
                        <span className="font-bold text-gray-800 text-sm">Select Reason</span>
                        <button onClick={handleCancelReject} className="p-1 hover:bg-gray-100 rounded-full">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-1 max-h-[160px] overflow-y-auto no-scrollbar p-2">
                        {REJECTION_REASONS.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => handleSelectReason(reason)}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 text-xs font-medium transition-colors flex items-center justify-between group"
                          >
                            {reason}
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
          <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
