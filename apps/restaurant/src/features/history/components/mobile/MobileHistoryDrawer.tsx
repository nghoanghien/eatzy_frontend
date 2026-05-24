'use client';

import { motion, AnimatePresence } from '@repo/ui/motion';
import { ImageWithFallback, PullToRefresh } from '@repo/ui';
import {
  X, User, MapPin, Clock, ShieldCheck, Package, Store,
  CheckCircle, AlertCircle, RotateCcw, Banknote, Phone
} from '@repo/ui/icons';
import { OrderHistoryItem } from '@repo/types';
import { formatCurrency } from '@repo/lib';
import { useMobileBackHandler } from '@/hooks/useMobileBackHandler';

interface MobileHistoryDrawerProps {
  open: boolean;
  order: OrderHistoryItem | null;
  onClose: () => void;
}

export default function MobileHistoryDrawer({ open, order, onClose }: MobileHistoryDrawerProps) {
  // Intercept Android/Mobile back button to close drawer
  useMobileBackHandler(open, onClose);

  if (!order) return null;

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const statusKey = order.status.toUpperCase();
  const statusConfig: Record<string, { bg: string; text: string; border: string; icon: typeof CheckCircle; label: string }> = {
    PENDING: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: Clock, label: 'Pending' },
    PREPARING: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: RotateCcw, label: 'Preparing' },
    READY: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: CheckCircle, label: 'Ready' },
    DRIVER_ASSIGNED: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', icon: User, label: 'Driver Assigned' },
    PICKED_UP: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', icon: Clock, label: 'Picked Up' },
    ARRIVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle, label: 'Arrived' },
    DELIVERED: { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200', icon: CheckCircle, label: 'Delivered' },
    COMPLETED: { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200', icon: CheckCircle, label: 'Completed' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle, label: 'Rejected' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle, label: 'Cancelled' },
    REFUNDED: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: RotateCcw, label: 'Refunded' },
  };
  const config = statusConfig[statusKey] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Clock, label: statusKey };
  const StatusIcon = config.icon;

  const isCancelled = statusKey === 'CANCELLED' || statusKey === 'REJECTED';

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] md:hidden"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 18, stiffness: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[90] bg-[#F8F9FA] rounded-t-[40px] overflow-hidden h-[96vh] flex flex-col shadow-2xl border-t border-gray-100 md:hidden"
          >
            {/* Sticky Header */}
            <div className="bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 z-20 rounded-t-[40px] overflow-hidden">
              <div className="min-w-0 flex-1 pr-4">
                <h3 className="text-2xl font-anton font-bold text-[#1A1A1A] leading-tight uppercase">ORDER DETAILS</h3>
                <div className="text-gray-500 text-xs font-semibold mt-0.5 flex items-center gap-2">
                  <span>Order ID: #{order.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-700 hover:bg-gray-200 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 min-h-0 relative h-full">
              <PullToRefresh
                onRefresh={async () => { onClose(); }}
                className="h-full overflow-y-auto no-scrollbar"
                pullText="Pull to close"
                releaseText="Release to close"
                refreshingText="Closing..."
                usePortal={false}
              >
                <div className="flex flex-col gap-3 p-3 pb-20">
                  {/* Order Status Badge centered */}
                  <div className="flex justify-center w-full my-1 shrink-0">
                    <div className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm border flex items-center gap-2 ${config.bg} ${config.text} ${config.border}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span>{config.label}</span>
                    </div>
                  </div>

                  {isCancelled && (
                    <div className="bg-red-50/70 border border-red-150/50 p-4 rounded-[32px] flex items-start gap-3 shrink-0">
                      <div className="w-9 h-9 rounded-2xl bg-red-100 flex items-center justify-center shrink-0 text-red-555 border border-red-200/30">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <h5 className="font-black text-red-650 text-[11px] uppercase tracking-widest leading-none mb-1.5">Order Cancelled</h5>
                        <p className="text-[11px] text-gray-500 leading-normal font-semibold">
                          Reason: {order.cancellationReason || "Order was cancelled or rejected."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Customer Card */}
                  <div className="bg-white rounded-[32px] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100/50 shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-[20px] overflow-hidden bg-gray-50 border border-gray-100/80 flex-shrink-0 flex items-center justify-center shadow-inner">
                        {order.customerAvatar ? (
                          <ImageWithFallback src={order.customerAvatar} alt={order.customerName} fill className="object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] leading-none mb-1.5">Customer</h4>
                        <div className="font-bold text-[#1A1A1A] text-base leading-tight truncate">{order.customerName}</div>
                        {order.customerPhone ? (
                          <div className="text-xs text-gray-500 font-medium mt-1">{order.customerPhone}</div>
                        ) : (
                          <div className="text-xs text-gray-400 font-medium mt-1">No phone number</div>
                        )}
                      </div>
                      {order.customerPhone && (
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="w-9 h-9 rounded-full bg-lime-50 border border-lime-100 flex items-center justify-center text-lime-600 shadow-sm active:scale-95 transition-all"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Driver Card */}
                  <div className="bg-white rounded-[32px] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100/50 shrink-0">
                    {order.driver ? (
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-[20px] overflow-hidden bg-gray-50 border border-gray-100/80 flex-shrink-0 flex items-center justify-center shadow-inner">
                          {order.driver.avatar ? (
                            <ImageWithFallback src={order.driver.avatar} alt={order.driver.name} fill className="object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] leading-none mb-1.5">Driver</h4>
                          <div className="font-bold text-[#1A1A1A] text-base leading-tight truncate">{order.driver.name}</div>
                          <div className="text-xs text-gray-500 font-medium mt-1 truncate">
                            {order.driver.vehicleType} • {order.driver.licensePlate}
                          </div>
                        </div>
                        {order.driver.phone && (
                          <a
                            href={`tel:${order.driver.phone}`}
                            className="w-9 h-9 rounded-full bg-lime-50 border border-lime-100 flex items-center justify-center text-lime-600 shadow-sm active:scale-95 transition-all"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 py-1.5">
                        <div className="w-12 h-12 rounded-[20px] bg-gray-50 border border-gray-100/50 flex items-center justify-center shrink-0">
                          <Store className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] leading-none mb-1.5">Driver</h4>
                          <div className="font-bold text-gray-400 text-sm">No Driver Assigned</div>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Self-pickup or cancelled before assignment</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delivery Route */}
                  <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100/50 shrink-0">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <h4 className="font-bold text-[#1A1A1A] text-base">Delivery Route</h4>
                    </div>
                    <div className="p-5 flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-8 h-8 rounded-full bg-lime-100 flex items-center justify-center z-10 shadow-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                        </div>
                        <div className="w-0.5 flex-grow border-l-2 border-dotted border-gray-300 my-1.5" />
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center z-10 shadow-sm">
                          <MapPin className="w-4 h-4 text-red-500" />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <div className="pb-6">
                          <div className="text-[8px] font-black text-[var(--primary)] uppercase tracking-[0.15em] mb-1">Pick up</div>
                          <div className="font-bold text-[#1A1A1A] text-sm truncate">{order.restaurantName || 'Eatzy Store'}</div>
                          <div className="text-xs text-gray-450 font-medium truncate mt-0.5">{order.pickupAddress}</div>
                        </div>
                        <div>
                          <div className="text-[8px] font-black text-red-500 uppercase tracking-[0.15em] mb-1">Drop off</div>
                          <div className="font-bold text-[#1A1A1A] text-sm leading-tight line-clamp-2">{order.deliveryAddress || 'Customer Address'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Banner */}
                  <div className="bg-gradient-to-r from-lime-50 to-white border border-lime-100/30 p-3.5 rounded-[28px] flex items-center gap-3 shrink-0">
                    <div className="w-7 h-7 rounded-full bg-lime-100 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                    <p className="text-[10px] text-[var(--primary)] leading-relaxed font-semibold">
                      This order is protected by Eatzy Guarantee.
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100/50 shrink-0">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-gray-400" />
                        <h4 className="font-bold text-[#1A1A1A] text-base">Item Details</h4>
                      </div>
                      <span className="text-xs font-bold bg-[#1A1A1A] text-white px-3 py-1 rounded-lg">{totalItems} items</span>
                    </div>

                    <div className="p-2 pt-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 rounded-[20px] transition-colors duration-200">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-9 h-9 rounded-[14px] bg-gray-100 text-[#1A1A1A] font-anton font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                              {item.quantity}x
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#1A1A1A] text-sm truncate leading-tight">{item.name}</div>
                              <div className="text-[10px] text-gray-400 font-medium mt-0.5">Standard option</div>
                            </div>
                          </div>
                          <span className="font-bold text-[#1A1A1A] text-sm shrink-0 pl-2 tabular-nums">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bill Summary */}
                    <div className="bg-gray-50/30 p-5 space-y-3.5 border-t border-gray-100">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Subtotal</span>
                        <span className="font-bold text-gray-900">{formatCurrency(order.items.reduce((acc, i) => acc + i.price * i.quantity, 0))}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Delivery Fee</span>
                        <span className="font-bold text-gray-900">{formatCurrency(order.deliveryFee || 0)}</span>
                      </div>

                      {order.discount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">Promotion</span>
                            {order.voucherCode && (
                              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded-md">
                                {order.voucherCode}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-red-500">-{formatCurrency(order.discount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Method</span>
                        <div className="flex items-center gap-1.5">
                          {order.paymentMethod === 'vnpay' && <span className="text-[9px] font-bold bg-blue-100 text-blue-750 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-blue-200">VNPay</span>}
                          {order.paymentMethod === 'cash' && <span className="text-[9px] font-bold bg-lime-100 text-[var(--primary)] px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-lime-200">Cash</span>}
                          {order.paymentMethod === 'wallet' && <span className="text-[9px] font-bold bg-purple-100 text-purple-750 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-purple-200">Wallet</span>}
                          {!['vnpay', 'cash', 'wallet'].includes(order.paymentMethod) && <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-gray-200">{order.paymentMethod}</span>}
                        </div>
                      </div>

                      <div className="h-px bg-gray-200/50 my-2" />

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wider">Total Amount</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                        <span className="font-anton text-[26px] text-[var(--primary)] leading-none whitespace-nowrap drop-shadow-sm">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profit Information */}
                  {!isCancelled && (
                    <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100/50 shrink-0">
                      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                        <Banknote className="w-5 h-5 text-gray-400" />
                        <h4 className="font-bold text-[#1A1A1A] text-base">Profit Breakdown</h4>
                      </div>

                      <div className="p-5 space-y-3.5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Subtotal</span>
                          <span className="font-bold text-gray-900">{formatCurrency(order.netIncome + order.platformFee)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Platform Commission (15%)</span>
                          <span className="font-bold text-red-550">-{formatCurrency(order.platformFee)}</span>
                        </div>

                        <div className="h-px bg-gray-200 my-2" />

                        <div className="flex justify-between items-center pt-2">
                          <span className="font-bold text-[#1A1A1A] text-sm">Net Income</span>
                          <span className="font-anton text-xl text-[var(--primary)]">{formatCurrency(order.netIncome)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </PullToRefresh>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
