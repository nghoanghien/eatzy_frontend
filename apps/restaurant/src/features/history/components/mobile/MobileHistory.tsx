'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from '@repo/ui/motion';
import { Search, Filter, X, FileText, CheckCircle2, AlertCircle } from '@repo/ui/icons';
import { PullToRefresh, HistoryCardShimmer } from '@repo/ui';
import { useInfiniteScroll } from '@repo/hooks';
import { OrderHistoryItem } from '@repo/types';
import { EmptyState } from '@/components/ui/EmptyState';

import MobileHistoryCard from './MobileHistoryCard';
import MobileHistoryDrawer from './MobileHistoryDrawer';
import OrderHistoryFilterModal from '../OrderHistoryFilterModal';
import { useBottomNav } from '@/app/(protected)/(normal)/context/BottomNavContext';

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
  isError?: boolean;
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
  filterQuery,
  isError = false
}: MobileHistoryProps) {
  const [searchInputValue, setSearchInputValue] = useState(searchTerm);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { setIsVisible } = useBottomNav();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
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
      <div className="absolute top-0 left-0 right-0 z-30 bg-[#F7F7F7]/85 backdrop-blur-md px-4 pt-5 pb-4 max-md:[mask-image:linear-gradient(to_bottom,black_90%,transparent)]">
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
                  placeholder="Search ID or Customer..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSearch(searchInputValue);
                    }
                  }}
                  className="w-full pl-9 pr-9 py-2 bg-gray-200/70 border border-gray-250 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:border-lime-500 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
                />
                {searchInputValue && (
                  <button
                    onClick={() => {
                      setSearchInputValue("");
                      onSearch("");
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
                  setSearchInputValue("");
                  onSearch("");
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
                  ORDER HISTORY
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSearchOpen(true)}
                  className={`relative w-10 h-10 rounded-2xl border-2 flex items-center justify-center shadow-md transition-colors ${searchInputValue
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

      {/* Main Order List with Pull to Refresh & Infinite Scroll */}
      <PullToRefresh
        ref={scrollContainerRef}
        onRefresh={async () => {
          onRefresh();
        }}
        className="flex-1 overflow-y-auto no-scrollbar"
        pullText="Kéo để cập nhật đơn hàng"
        releaseText="Thả tay để cập nhật"
        refreshingText="Đang tải..."
      >
        <div className="p-3.5 pt-20 space-y-3 pb-32 relative">
          {isError ? (
            <EmptyState
              icon={AlertCircle}
              title="Failed to Load History"
              description="Could not retrieve order history logs. Please check your connection and try again."
              className="py-16"
              buttonText="Retry"
              onButtonClick={onRefresh}
            />
          ) : isLoading && filteredData.length === 0 ? (
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
                  className="py-16"
                  buttonText="Clear Filters"
                  onButtonClick={handleClearFilters}
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
