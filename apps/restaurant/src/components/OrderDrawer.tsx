'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from '@repo/ui/motion';
import { X, User, MapPin, Clock, ShieldCheck, Package, Store, CheckCircle, AlertCircle, RotateCcw, Banknote, Bike, Ticket, Loader2, XCircle, ChevronRight } from '@repo/ui/icons';
import { formatVnd } from '@repo/lib';
import type { Order, OrderItem } from '@repo/types';
import { useSwipeConfirmation } from '@repo/ui';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRestaurantCommission } from '@/features/store';
import '@repo/ui/styles/scrollbar.css';

interface OrderDrawerProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string) => void;
  onReject: (orderId: string, reason: string) => void;
  onComplete: (orderId: string) => void;
  loading?: boolean;
}

const REJECTION_REASONS = [
  'Out of stock',
  'Restaurant overloaded',
  'Cannot contact customer',
  'Delivery address too far',
  'Item unavailable',
  'Other reasons'
];

export default function OrderDrawer({ open, order, onClose, onConfirm, onReject, onComplete, loading = false }: OrderDrawerProps) {
  const { confirm } = useSwipeConfirmation();
  const [showRejectReasons, setShowRejectReasons] = useState(false);
  const { commissionRate } = useRestaurantCommission();

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
      title: 'Reject order',
      description: `Are you sure you want to reject this order for: "${reason}"?`,
      confirmText: 'Reject',
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

  const isPending = order.status === 'PLACED' || order.status === 'PENDING';
  const isPrepared = order.status === 'PREPARED';
  const hasActions = isPending || isPrepared || showRejectReasons;

  const datetime = order.createdAt
    ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })
    : '';

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
            className="hidden md:block fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
          />

          {/* Modal Container */}
          <div className="hidden md:flex fixed inset-0 z-[90] items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-[#F8F9FA] w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] border border-white/20"
            >
              {/* Header */}
              <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm/50">
                <div>
                  <h3 className="text-2xl font-anton font-bold text-[#1A1A1A]">ORDER DETAILS</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-gray-400">ID:</span>
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-mono">{order.code}</span>
                    <span className="text-gray-300 mx-1">|</span>
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500" suppressHydrationWarning>{datetime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {(() => {
                    const statusConfig: Record<string, { bg: string; text: string; border: string; icon: typeof CheckCircle; label: string }> = {
                      DELIVERED: { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200', icon: CheckCircle, label: 'Delivered' },
                      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle, label: 'Cancelled' },
                      // Active statuses
                      PLACED: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'Pending' },
                      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'Pending' },
                      PREPARED: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Clock, label: 'Preparing' },
                      PICKED: { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200', icon: Bike, label: 'Waiting Driver' },
                    };
                    const config = statusConfig[order.status] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Clock, label: order.status };

                    const Icon = config.icon;

                    return (
                      <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border flex items-center gap-2 ${config.bg} ${config.text} ${config.border}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </div>
                    );
                  })()}
                  <button
                    onClick={onClose}
                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-700 hover:bg-gray-200 transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar pb-6">

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Customer Card */}
                  <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</h4>
                        <div className="font-bold text-[#1A1A1A] line-clamp-1">{order.customer?.name || 'Guest User'}</div>
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full mb-3" />

                    <div className="mt-auto">
                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Phone</div>
                      <div className="text-xs font-bold text-[#1A1A1A]">{order.customer?.phoneNumber || 'No phone provided'}</div>
                    </div>
                  </div>

                  {/* Driver Card */}
                  <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50">
                    {order.driverLocation?.name || order.status === "PICKED" ? (
                      <div className="h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                            <Bike className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Driver</h4>
                            <div className="font-bold text-[#1A1A1A] line-clamp-1">{order.driverLocation?.name || 'Searching for driver...'}</div>
                          </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full mb-3" />

                        <div className="flex items-center mt-auto">
                          <div className="flex-grow">
                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Status</div>
                            <div className={`text-xs font-bold ${order.driverLocation?.name ? 'text-blue-600' : 'text-yellow-600'}`}>
                              {order.driverLocation?.name ? 'Active' : 'Finding driver'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                          <Store className="w-5 h-5 text-gray-500" />
                        </div>
                        <h4 className="font-bold text-gray-400 text-sm">No Driver Assigned</h4>
                        <p className="text-xs text-gray-400">Order is pending kitchen acceptance</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Route */}
                <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <h4 className="font-bold text-[#1A1A1A]">Delivery Route</h4>
                  </div>
                  <div className="p-5 flex gap-4">
                    {/* Left Timeline Column */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-lime-100 flex items-center justify-center shadow-sm flex-shrink-0 z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      </div>
                      <div className="w-0.5 flex-grow border-l-2 border-dotted border-gray-300 my-1" />
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shadow-sm flex-shrink-0 z-10">
                        <MapPin className="w-4 h-4 text-red-500" />
                      </div>
                    </div>

                    {/* Right Content Column */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div className="pb-6">
                        <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Pick up</div>
                        <div className="font-bold text-[#1A1A1A] text-base mb-0.5 line-clamp-1">{order.restaurantLocation?.name || 'Eatzy Restaurant'}</div>
                        <div className="text-xs text-gray-500 font-medium line-clamp-1">{order.restaurantLocation?.name ? 'Restaurant Location' : 'Default Address'}</div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Drop off</div>
                        <div className="font-bold text-[#1A1A1A] text-base mb-0.5 line-clamp-2">{order.deliveryLocation?.address || 'Customer Address'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safety Banner */}
                <div className="bg-gradient-to-r from-lime-50 to-white border border-lime-100/50 p-4 rounded-[24px] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-primary leading-relaxed font-medium">
                    This order is protected by Eatzy Guarantee. <span className="font-bold cursor-pointer hover:underline">Learn more</span>
                  </p>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50">
                  <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-400" />
                      <h4 className="font-bold text-[#1A1A1A]">Order Items</h4>
                    </div>
                    <span className="text-xs font-bold bg-[#1A1A1A] text-white px-2.5 py-1 rounded-lg">{order.items.length} items</span>
                  </div>

                  <div className="p-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-[20px] transition-colors duration-200">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-[14px] bg-gray-100 text-[#1A1A1A] font-anton text-lg flex items-center justify-center shadow-sm group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                            {item.quantity}x
                          </div>
                          <div>
                            <div className="font-bold text-[#1A1A1A] text-sm group-hover:text-primary transition-colors">{item.name}</div>
                            {item.options?.variant && (
                              <div className="text-xs text-gray-400 font-medium">{item.options.variant.name}</div>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-[#1A1A1A] text-sm">{formatVnd(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bill Summary */}
                  <div className="bg-gray-50/55 p-6 space-y-3 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Subtotal</span>
                      <span className="font-bold text-gray-900">{formatVnd(order.subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Delivery Fee</span>
                      <span className="font-bold text-gray-900">{formatVnd(order.fee)}</span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium">Discount</span>
                        </div>
                        <span className="font-bold text-red-500">-{formatVnd(order.discount)}</span>
                      </div>
                    )}

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4 opacity-50" />

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1A1A1A] text-base">Total Amount</span>
                      </div>
                      <span className="font-anton text-3xl text-primary drop-shadow-sm">{formatVnd(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Profit Info / Payment Audit */}
                {order.status !== 'CANCELLED' && (
                  <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
                      <Banknote className="w-5 h-5 text-gray-400" />
                      <h4 className="font-bold text-[#1A1A1A]">Profit Information</h4>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Order Subtotal</span>
                        <span className="font-bold text-gray-900">{formatVnd(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-red-500">
                        <span className="font-medium">System Commission ({commissionRate}%)</span>
                        <span className="font-bold">-{formatVnd(systemCommission)}</span>
                      </div>

                      <div className="h-px bg-gray-100 my-2" />

                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#1A1A1A] text-base">Net Profit</span>
                        <span className="font-anton text-2xl text-primary">{formatVnd(netProfit)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              {hasActions && (
                <div className="bg-white border-t border-gray-100 p-6 sticky bottom-0 z-10 shrink-0">
                  <AnimatePresence mode="wait">
                    {!showRejectReasons ? (
                      <motion.div
                        key="action-buttons"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-4"
                      >
                        {isPending && (
                          <>
                            <motion.button
                              whileHover={loading ? {} : { scale: 1.02 }}
                              whileTap={loading ? {} : { scale: 0.98 }}
                              onClick={handleConfirmOrder}
                              disabled={loading}
                              className={`flex-1 py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${loading
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-[#1A1A1A] text-white shadow-black/10 hover:shadow-2xl hover:bg-black group'
                                }`}
                            >
                              {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                              ) : (
                                <>
                                  <span>Confirm Order</span>
                                  <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CheckCircle className="w-5 h-5" strokeWidth={3} />
                                  </div>
                                </>
                              )}
                            </motion.button>

                            <motion.button
                              whileHover={loading ? {} : { scale: 1.02 }}
                              whileTap={loading ? {} : { scale: 0.98 }}
                              onClick={handleRejectOrder}
                              disabled={loading}
                              className="flex-1 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-500 font-bold hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            >
                              <XCircle className="w-5 h-5" />
                              <span>Reject Order</span>
                            </motion.button>
                          </>
                        )}

                        {isPrepared && (
                          <motion.button
                            whileHover={loading ? {} : { scale: 1.02 }}
                            whileTap={loading ? {} : { scale: 0.98 }}
                            onClick={handleCompleteOrder}
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${loading
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-lime-500 text-white shadow-lime-500/30 hover:bg-lime-600'
                              }`}
                          >
                            {loading ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                              <>
                                <span>Mark as Ready</span>
                                <CheckCircle className="w-6 h-6" />
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
                        className="bg-white rounded-[24px] p-5 shadow-lg border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-bold text-gray-800">Select Reason</span>
                          <button onClick={handleCancelReject} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                          {REJECTION_REASONS.map((reason) => (
                            <button
                              key={reason}
                              onClick={() => handleSelectReason(reason)}
                              className="text-left px-4 py-3 rounded-xl hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-colors flex items-center justify-between group border border-gray-100 hover:border-red-200"
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
