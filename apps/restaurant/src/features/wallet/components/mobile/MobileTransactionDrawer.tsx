"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "@repo/ui/motion";
import { WalletTransaction } from "@repo/types";
import {
  X, CheckCircle2, AlertCircle, Clock, Wallet,
  ArrowRight, Ban, Receipt, RefreshCw
} from "@repo/ui/icons";
import { PullToRefresh } from "@repo/ui";
import { formatVnd } from "@repo/lib";
import { useMobileBackHandler } from "@/hooks/useMobileBackHandler";

interface MobileTransactionDrawerProps {
  transaction: WalletTransaction | null;
  open: boolean;
  onClose: () => void;
  onViewOrder?: (orderId: number) => void;
  isOrderLoading?: boolean;
}

export default function MobileTransactionDrawer({
  transaction,
  open,
  onClose,
  onViewOrder,
  isOrderLoading
}: MobileTransactionDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useMobileBackHandler(open, onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const isCredit = transaction ? transaction.amount > 0 : false;
  const isSuccess = transaction?.status === 'success';
  const statusColor = isSuccess ? "text-green-650" : "text-red-650";
  const StatusIcon = isSuccess ? CheckCircle2 : AlertCircle;
  const statusLabel = isSuccess ? "SUCCESS" : "FAILED";

  return createPortal(
    <AnimatePresence>
      {open && transaction && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          {/* Slide up Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 18, stiffness: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[210] bg-white rounded-t-[40px] overflow-hidden h-[85vh] max-h-[85vh] flex flex-col shadow-2xl"
          >
            <div className="relative flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
                <div>
                  <h2 className="text-2xl font-bold font-anton text-[#1A1A1A] uppercase leading-none">TRANSACTION DETAILS</h2>
                  <p className="text-gray-500 text-xs font-semibold mt-1">
                    {transaction.id} • {formatDate(transaction.date)}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <PullToRefresh
                onRefresh={async () => { onClose(); }}
                className="flex-1 no-scrollbar overflow-y-auto"
                pullText="Pull down to close"
                releaseText="Release to close"
                refreshingText="Closing..."
                usePortal={false}
              >
                <div className="flex flex-col min-h-full p-6 px-4 space-y-6">
                  {/* Stats Row */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-3xl">
                    <div className="text-center flex-1 border-r border-gray-200 last:border-0 px-2">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Time</div>
                      <div className="text-base font-bold text-[#1A1A1A] font-anton">
                        {formatTime(transaction.date)}
                      </div>
                    </div>
                    <div className="text-center flex-1 border-r border-gray-200 last:border-0 px-2">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Date</div>
                      <div className="text-base font-bold text-[#1A1A1A] font-anton">
                        {formatDate(transaction.date)}
                      </div>
                    </div>
                    <div className="text-center flex-1 px-2 min-w-0">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Type</div>
                      <div className="text-[11px] font-bold text-[#1A1A1A] font-anton uppercase truncate">
                        {transaction.category}
                      </div>
                    </div>
                  </div>

                  {/* Amount Section */}
                  <div className="bg-white rounded-[32px] p-5 shadow-sm border-2 border-gray-200 text-center relative overflow-hidden">
                    <div className="py-2">
                      <p className={`text-4xl font-bold font-anton ${isCredit ? 'text-lime-500' : 'text-[#1A1A1A]'}`}>
                        {isCredit ? '+' : '-'}{formatVnd(Math.abs(transaction.amount))}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                        <StatusIcon size={14} className={statusColor} />
                        <span>{statusLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Linked Order Action */}
                  {transaction.orderId && onViewOrder && (
                    <button
                      onClick={() => onViewOrder(transaction.orderId!)}
                      disabled={isOrderLoading}
                      className="w-full bg-[#1A1A1A] hover:bg-black text-white p-5 rounded-[28px] flex items-center justify-between group transition-all duration-300 shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-75"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                          {isOrderLoading ? (
                            <RefreshCw className="w-6 h-6 text-[var(--primary)] animate-spin" />
                          ) : (
                            <Receipt className="w-6 h-6 text-[var(--primary)]" />
                          )}
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-0.5">Linked Order</span>
                          <span className="block text-base font-anton uppercase tracking-tight">
                            {isOrderLoading ? "Loading details..." : "View Order Details"}
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  )}

                  {/* Info Details */}
                  <div className="bg-white rounded-[32px] p-5 shadow-sm border-2 border-gray-200">
                    <h3 className="text-lg font-bold font-anton text-[#1A1A1A] mb-4 uppercase leading-none">DETAILES</h3>
                    <div className="space-y-1">
                      {transaction.orderId && (
                        <div className="flex justify-between items-center text-sm p-1">
                          <span className="font-bold text-gray-500">Order ID</span>
                          <span className="font-bold text-[#1A1A1A] text-right">#{transaction.orderId}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm p-1">
                        <span className="font-bold text-gray-500">Category</span>
                        <span className="font-bold text-[#1A1A1A] text-right">{transaction.category}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm p-1">
                        <span className="font-bold text-gray-500">Amount</span>
                        <span className="font-bold text-[#1A1A1A] text-right">{formatVnd(Math.abs(transaction.amount))}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm p-1">
                        <span className="font-bold text-gray-500">Balance After</span>
                        <span className="font-bold text-[#1A1A1A] text-right">{formatVnd(transaction.balanceAfter)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="bg-white rounded-[32px] p-5 shadow-sm border-2 border-gray-200">
                    <h3 className="text-lg font-bold font-anton text-[#1A1A1A] mb-4 uppercase leading-none">DESCRIPTION</h3>
                    <p className="text-sm pl-2 font-medium text-gray-600 leading-relaxed">
                      {transaction.description}.
                      {isSuccess && " Transaction has been processed and completed successfully."}
                    </p>
                  </div>
                </div>
              </PullToRefresh>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
