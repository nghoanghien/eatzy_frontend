"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "@repo/ui/motion";
import {
  Wallet, Eye, EyeOff, Plus, History, CheckCircle2, Clock, Ban, Receipt, HandCoins, RefreshCw, Filter, Search,
  X
} from "@repo/ui/icons";
import { useInfiniteScroll } from "@repo/hooks";
import { PullToRefresh, TransactionRowShimmer } from "@repo/ui";
import { formatVnd } from "@repo/lib";
import { useWalletTransactions, useMyWallet } from "../../hooks";
import MobileTransactionDrawer from "./MobileTransactionDrawer";
import WalletFilterModal from "../WalletFilterModal";
import { WalletTransaction } from "@repo/types";
import { useBottomNav } from "@/app/(protected)/(normal)/context/BottomNavContext";

interface MobileWalletProps {
  onWithdraw: () => void;
  onViewOrder?: (orderId: number) => void;
  isOrderLoading?: boolean;
  order?: any;
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
};

export default function MobileWallet({ onWithdraw, onViewOrder, isOrderLoading, order }: MobileWalletProps) {
  const [showBalance, setShowBalance] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterFields, setFilterFields] = useState({
    status: '',
    dateRange: { from: null as Date | null, to: null as Date | null },
    amountRange: { min: -100000000, max: 100000000 }
  });
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchFields = useMemo(() => ({
    id: searchQuery,
    description: searchQuery
  }), [searchQuery]);

  // Close transaction drawer automatically once order details are successfully loaded
  useEffect(() => {
    if (!isOrderLoading && order && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }, [isOrderLoading, order, isDrawerOpen]);

  const containerRef = useRef<HTMLDivElement>(null);
  const { setIsVisible } = useBottomNav();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;
      const diff = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      if (Math.abs(diff) < 3) return;

      if (diff > 5 && currentScrollY > 20) {
        setIsVisible(false);
      } else if (diff < -5) {
        setIsVisible(true);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      setIsVisible(true);
    };
  }, [setIsVisible]);

  const { balance, isLoading: isWalletLoading, refetch: refetchWallet } = useMyWallet();

  // Build filter query string for API matching desktop layout
  const filterQuery = useMemo(() => {
    const filters: string[] = [];

    if (filterFields.status) {
      filters.push(`status~'${filterFields.status.toUpperCase()}'`);
    }

    if (filterFields.dateRange.from) {
      filters.push(`createdAt>:'${filterFields.dateRange.from.toISOString()}'`);
    }
    if (filterFields.dateRange.to) {
      const toDate = new Date(filterFields.dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filters.push(`createdAt<:'${toDate.toISOString()}'`);
    }

    if (filterFields.amountRange.min > -100000000) {
      filters.push(`amount>=${filterFields.amountRange.min}`);
    }
    if (filterFields.amountRange.max < 100000000) {
      filters.push(`amount<=${filterFields.amountRange.max}`);
    }

    return filters.join(' and ');
  }, [filterFields]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterFields.status) count++;
    if (filterFields.dateRange.from) count++;
    if (filterFields.dateRange.to) count++;
    if (filterFields.amountRange.min !== -100000000 || filterFields.amountRange.max !== 100000000) count++;
    return count;
  }, [filterFields]);

  const {
    transactions,
    isLoading: isTransactionsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchTransactions
  } = useWalletTransactions(searchFields, filterQuery);

  const isLoading = isWalletLoading || isTransactionsLoading;

  const handleRefresh = async () => {
    await Promise.all([refetchWallet(), refetchTransactions()]);
  };

  const { sentinelRef } = useInfiniteScroll({
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    isLoading: isLoading,
    onLoadMore: fetchNextPage,
    rootMargin: "200px",
  });

  const getTransactionIcon = (category: string, status: string) => {
    if (status === 'failed') return Ban;
    if (status === 'pending') return Clock;

    switch (category) {
      case 'Food Order':
      case 'Order Payment':
        return Receipt;
      case 'Withdrawal':
        return RefreshCw;
      case 'Refund':
        return HandCoins;
      default:
        return RefreshCw;
    }
  };

  const handleTransactionClick = (tx: WalletTransaction) => {
    setSelectedTransaction(tx);
    setIsDrawerOpen(true);
  };

  const handleApplyFilters = (newFilters: typeof filterFields) => {
    setFilterFields(newFilters);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F7F7] relative overflow-hidden">
      <PullToRefresh
        onRefresh={handleRefresh}
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        pullText="Pull to refresh"
        releaseText="Release to refresh"
        refreshingText="Refreshing..."
        ref={containerRef}
      >
        <div className="max-w-2xl mx-auto px-4 w-full pt-0 pb-32">
          {/* Sticky Header */}
          <div className="sticky top-0 z-50 bg-[#F7F7F7]/85 backdrop-blur-md pt-5 pb-4 -mx-4 px-4 flex items-center justify-between shrink-0 max-md:[mask-image:linear-gradient(to_bottom,black_85%,transparent)]">
            <AnimatePresence mode="popLayout">
              {isSearchOpen ? (
                <motion.div
                  key="search-bar"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 w-full px-1"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search ID or description..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSearchQuery(searchInput);
                        }
                      }}
                      className="w-full pl-9 pr-9 py-2 bg-gray-200/70 border border-gray-250 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:border-lime-500 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
                    />
                    {searchInput && (
                      <button
                        onClick={() => {
                          setSearchInput('');
                          setSearchQuery('');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-300/60 text-gray-500 hover:bg-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchInput('');
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-gray-950 transition-colors px-2 py-2"
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="header-default"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-between w-full px-1"
                >
                  <div>
                    <h1 className="text-2xl font-anton font-bold text-gray-900 uppercase tracking-tight leading-none">
                      STORE WALLET
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSearchOpen(true)}
                      className={`relative w-10 h-10 rounded-2xl border-2 flex items-center justify-center shadow-md transition-colors ${searchQuery
                        ? 'bg-lime-500 border-lime-400 text-white shadow-lime-500/20'
                        : 'bg-gray-200/70 border-gray-200 text-gray-400'
                        }`}
                      title="Search Options"
                    >
                      <Search size={20} strokeWidth={2.8} />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFilterOpen(true)}
                      className={`relative w-10 h-10 rounded-2xl border-2 flex items-center justify-center shadow-md transition-colors ${activeFiltersCount > 0
                        ? 'bg-lime-500 border-lime-400 text-white shadow-lime-500/20'
                        : 'bg-gray-200/70 border-gray-200 text-gray-400'
                        }`}
                      title="Filter Options"
                    >
                      <Filter size={20} strokeWidth={2.8} />
                      {activeFiltersCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-scale-in">
                          {activeFiltersCount}
                        </span>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Balance Card */}
          <div className="pt-0.5 pb-0">
            <div className="w-full bg-[#1A1A1A] rounded-[32px] p-6 text-white relative overflow-hidden shadow shadow-black/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

              {/* Withdraw Action Button */}
              <div className="absolute top-0 right-0">
                <button
                  onClick={onWithdraw}
                  className="px-4 py-2 bg-lime-400 font-bold text-black text-[12px] rounded-tr-[32px] rounded-bl-[20px] shadow-lg active:scale-95 transition-all flex items-center gap-1.5 hover:bg-lime-300"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                  Withdraw
                </button>
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">
                  Available Balance
                </span>
                <div className="flex items-baseline gap-3">
                  {isWalletLoading ? (
                    <div className="h-10 w-40 bg-white/10 rounded-xl animate-pulse" />
                  ) : (
                    <>
                      <h2 className="text-4xl font-anton tracking-tight">
                        {showBalance ? formatVnd(balance).replace("₫", "").trim() : "••••••"}
                      </h2>
                      <span className="text-lg font-anton text-lime-500">VND</span>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="ml-2 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                      >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="mt-4 space-y-1">
            {isTransactionsLoading && transactions.length === 0 ? (
              <div className="space-y-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <TransactionRowShimmer index={i} className="!py-2 !px-0" />
                    {i < 4 && <div className="h-px bg-slate-100 mx-4" />}
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-16 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center text-gray-400 bg-white shadow-sm">
                <History size={32} className="opacity-30 mb-3" />
                <p className="text-xs font-bold uppercase tracking-wider">No transactions found</p>
                <p className="text-[11px] text-gray-400 mt-1">Transaction activities will be updated here</p>
              </div>
            ) : (
              <>
                {transactions.map((tx, idx) => {
                  const Icon = getTransactionIcon(tx.category, tx.status);
                  const isCredit = tx.amount > 0;
                  const statusColor = tx.status === 'success' ? "text-lime-500" : tx.status === 'pending' ? "text-amber-500" : "text-red-500";
                  const statusText = tx.status === 'success' ? "Success" : tx.status === 'pending' ? "Processing" : "Failed";

                  return (
                    <div key={tx.id}>
                      <div className="px-0 py-1">
                        <div
                          className="flex items-center gap-3 py-2 px-0 transition-all duration-300 rounded-[32px] cursor-pointer hover:bg-slate-100/70 hover:shadow-md active:scale-[0.98]"
                          onClick={() => handleTransactionClick(tx)}
                        >
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center bg-white shadow-sm ring-4 ring-slate-50/30">
                              <Icon className={`w-5 h-5 ${isCredit ? "text-lime-650" : "text-slate-600"}`} />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col">
                            <h4 className="text-[15px] font-bold text-slate-900 truncate tracking-tight">
                              {tx.description || "Eatzy Transaction"}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {formatDate(tx.date)}
                            </p>
                            <div className="flex items-center mt-1 opacity-60">
                              <span className="text-[11px] text-slate-500 font-medium">
                                Balance: <span className="font-bold text-slate-600">
                                  {showBalance ? `${Math.floor(tx.balanceAfter).toLocaleString('vi-VN')}đ` : '••••••'}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex flex-col justify-end shrink-0 min-w-fit pl-2">
                            <div className="text-[17px] font-bold text-slate-900 tracking-tight">
                              {isCredit ? '+' : ''}{Math.floor(tx.amount).toLocaleString('vi-VN')}đ
                            </div>
                            <p className={`text-[12px] font-bold mt-0.5 ${statusColor}`}>
                              {statusText}
                            </p>
                            <div className="flex items-center justify-end gap-1.5 mt-1 opacity-60">
                              <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
                                <Wallet size={10} className="text-lime-500" />
                              </div>
                              <span className="text-[11px] text-slate-500 font-semibold tracking-tight">
                                {(tx.transactionType as string)?.includes('VNPAY') ? 'VNPay' : 'Store Wallet'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {idx < transactions.length - 1 && (
                        <div className="h-px bg-slate-100 mx-4" />
                      )}
                    </div>
                  );
                })}

                <div ref={sentinelRef} className="h-1" />

                {isFetchingNextPage && (
                  <div className="py-4 flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {!hasNextPage && !isFetchingNextPage && (
                  <div className="py-6 flex items-center justify-center gap-4 opacity-40">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20" />
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest font-anton">End of list</span>
                    </div>
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PullToRefresh>

      <WalletFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filterFields={filterFields}
        onApply={handleApplyFilters}
      />

      <MobileTransactionDrawer
        transaction={selectedTransaction}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onViewOrder={onViewOrder}
        isOrderLoading={isOrderLoading}
      />
    </div>
  );
}
