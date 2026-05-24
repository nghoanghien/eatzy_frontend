'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from '@repo/ui/motion';
import { Search, Filter, X, FileText, CheckCircle2 } from '@repo/ui/icons';
import { PullToRefresh, HistoryCardShimmer } from '@repo/ui';
import { useInfiniteScroll } from '@repo/hooks';
import { OrderHistoryItem } from '@repo/types';
import { EmptyState } from '@/components/ui/EmptyState';

import MobileHistoryCard from './MobileHistoryCard';
import MobileHistoryDrawer from './MobileHistoryDrawer';
import OrderHistoryFilterModal from '../OrderHistoryFilterModal';

interface MobileHistoryProps {
  data: OrderHistoryItem[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onSearch: (term: string) => void;
  onFilter: (query: string) => void;
  searchTerm: string;
  filterQuery: string;
}

export default function MobileHistory({
  data,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onRefresh,
  onSearch,
  onFilter,
  searchTerm,
  filterQuery
}: MobileHistoryProps) {
  const [searchInputValue, setSearchInputValue] = useState(searchTerm);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter fields matching desktop view
  const [filterFields, setFilterFields] = useState({
    status: '',
    paymentMethod: [] as string[],
    paymentStatus: '',
    dateRange: { from: null as Date | null, to: null as Date | null },
    amountRange: { min: 0, max: 100000000 },
  });

  // Debounce search input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchInputValue);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchInputValue, onSearch]);

  // Set sentinel for infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    isLoading: isLoading,
    onLoadMore,
    rootMargin: '250px',
  });

  const handleApplyFilters = (newFilters: typeof filterFields) => {
    setFilterFields(newFilters);
    const filters: string[] = [];

    if (newFilters.status) {
      filters.push(`orderStatus:'${newFilters.status}'`);
    }

    if (newFilters.paymentMethod.length > 0) {
      const methodFilters = newFilters.paymentMethod
        .flatMap(m => [`paymentMethod:'${m}'`, `paymentMethod:'${m.toLowerCase()}'`])
        .join(' or ');
      filters.push(`(${methodFilters})`);
    }

    if (newFilters.paymentStatus) {
      filters.push(`paymentStatus:'${newFilters.paymentStatus}'`);
    }

    if (newFilters.dateRange.from) {
      const fromDate = new Date(newFilters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      filters.push(`createdAt>:'${fromDate.toISOString()}'`);
    }
    if (newFilters.dateRange.to) {
      const toDate = new Date(newFilters.dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filters.push(`createdAt<:'${toDate.toISOString()}'`);
    }

    if (newFilters.amountRange.min > 0) {
      filters.push(`totalAmount>=${newFilters.amountRange.min}`);
    }
    if (newFilters.amountRange.max < 100000000) {
      filters.push(`totalAmount<=${newFilters.amountRange.max}`);
    }

    const query = filters.join(' and ');
    onFilter(query);
  };

  const handleClearFilters = () => {
    setFilterFields({
      status: '',
      paymentMethod: [],
      paymentStatus: '',
      dateRange: { from: null, to: null },
      amountRange: { min: 0, max: 100000000 },
    });
    onFilter('');
    setSearchInputValue('');
    onSearch('');
    onRefresh();
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterFields.status) count++;
    if (filterFields.paymentMethod.length > 0) count++;
    if (filterFields.paymentStatus) count++;
    if (filterFields.dateRange.from) count++;
    if (filterFields.dateRange.to) count++;
    if (filterFields.amountRange.min > 0 || filterFields.amountRange.max < 100000000) count++;
    return count;
  }, [filterFields]);

  // Filter to show only completed (done) and cancelled/rejected orders
  const filteredData = useMemo(() => {
    return data.filter((order) => {
      const status = order.status.toUpperCase();
      return (
        status === 'COMPLETED' ||
        status === 'DELIVERED' ||
        status === 'CANCELLED' ||
        status === 'REJECTED'
      );
    });
  }, [data]);

  return (
    <div className="h-screen flex flex-col bg-[#F7F7F7] overflow-hidden md:hidden">
      {/* Sticky Header & Search area */}
      <div className="px-4 pt-4 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h1 className="text-2xl font-anton font-bold text-gray-900 uppercase tracking-tight leading-none">
              ORDER HISTORY
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(true)}
              className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center shadow-md transition-colors ${activeFiltersCount > 0
                ? 'bg-lime-500 border-lime-400 text-white shadow-lime-500/20'
                : 'bg-gray-200/70 border-gray-200 text-gray-400'
                }`}
              title="Filter Options"
            >
              <Filter size={20} strokeWidth={2.8} />
            </motion.button>
          </div>
        </div>

        {/* Search Bar - Styled exactly like menu search bar */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search ID or Customer..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            className="w-full bg-slate-50 border-2 border-white focus:border-[var(--primary)]/20 rounded-3xl py-4 pl-14 pr-12 text-base font-bold font-anton text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/5 transition-all shadow-[inset_0_0_20px_rgba(0,0,0,0.09)]"
          />
          {searchInputValue && (
            <button
              onClick={() => {
                setSearchInputValue("");
                onSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gray-200/50 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Order List with Pull to Refresh & Infinite Scroll */}
      <PullToRefresh
        onRefresh={async () => {
          onRefresh();
        }}
        className="flex-1 overflow-y-auto no-scrollbar"
        pullText="Kéo để cập nhật đơn hàng"
        releaseText="Thả tay để cập nhật"
        refreshingText="Đang tải..."
      >
        <div className="p-3.5 space-y-3 pb-32 relative">
          {isLoading && filteredData.length === 0 ? (
            <HistoryCardShimmer cardCount={3} />
          ) : (
            <>
              {filteredData.length > 0 ? (
                filteredData.map((order) => (
                  <MobileHistoryCard
                    key={order.id}
                    order={order}
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDrawerOpen(true);
                    }}
                  />
                ))
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No Orders Found"
                  description="Không tìm thấy đơn hàng nào khớp với tiêu chí tìm kiếm của bạn. Hãy thử thay đổi bộ lọc."
                  className="py-20"
                />
              )}

              {filteredData.length > 0 && (
                <>
                  {/* Sentinel for loading more - absolute to prevent margin spacing gaps */}
                  <div ref={sentinelRef} className="absolute h-0 w-0" />

                  {isFetchingNextPage && (
                    <HistoryCardShimmer cardCount={1} />
                  )}

                  {!hasNextPage && !isFetchingNextPage && (
                    <div className="pb-12 pt-6 flex items-center justify-center gap-4 opacity-40">
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20" />
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                        <span className="text-[14px] font-bold text-gray-400 uppercase font-anton tracking-wider">End of list</span>
                      </div>
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20" />
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </PullToRefresh>

      {/* FILTER MODAL */}
      <OrderHistoryFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filterFields={filterFields}
        onApply={handleApplyFilters}
      />

      {/* MOBILE DRAWER */}
      <MobileHistoryDrawer
        open={isDrawerOpen}
        order={selectedOrder}
        onClose={() => {
          setIsDrawerOpen(false);
          setTimeout(() => setSelectedOrder(null), 300);
        }}
      />
    </div>
  );
}
