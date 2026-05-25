'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from '@repo/ui/motion';
import {
  Search, Star, Sparkles, CheckCircle2, MessageSquare, Map, Tag, ChefHat,
  ChevronDown, Send, X, AlertCircle, ArrowLeft, ChevronRight
} from '@repo/ui/icons';
import { ImageWithFallback, ReviewItemShimmer, PullToRefresh } from '@repo/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMobileBackHandler } from '@/hooks/useMobileBackHandler';
import { useOrderDetail } from '@/features/history/hooks/useOrderDetail';
import MobileHistoryDrawer from '@/features/history/components/mobile/MobileHistoryDrawer';

import { useBottomNav } from '@/app/(protected)/(normal)/context/BottomNavContext';

interface ReviewDisplayItem {
  id: number;
  authorName: string;
  rating: number;
  date: string;
  content: string;
  reply: string | null;
  orderId: string;
}

interface MobileReviewsProps {
  reviews: ReviewDisplayItem[];
  isLoading: boolean;
  totalReviews: number;
  averageRating: number;
  ratingDistributionDisplay: { stars: number; count: number; percentage: number }[];
  unrepliedCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  selectedRating: number | null;
  setSelectedRating: (rating: number | null) => void;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  handleReply: (reviewId: number) => Promise<void>;
  isReplying: boolean;
  onRefresh: () => void;
}

export default function MobileReviews({
  reviews,
  isLoading,
  totalReviews,
  averageRating,
  ratingDistributionDisplay,
  unrepliedCount,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  selectedRating,
  setSelectedRating,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  handleReply,
  isReplying,
  onRefresh
}: MobileReviewsProps) {
  const router = useRouter();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { setIsVisible } = useBottomNav();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Hook and state to manage order details drawer loading
  const { order: selectedOrderDetails, fetchOrder, clearOrder } = useOrderDetail();
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  const handleOpenOrder = (orderId: string) => {
    setLoadingOrderId(orderId);
    fetchOrder(orderId);
  };

  useEffect(() => {
    if (selectedOrderDetails && loadingOrderId) {
      setIsOrderDrawerOpen(true);
      setLoadingOrderId(null);
    }
  }, [selectedOrderDetails, loadingOrderId]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  // Intercept system back button to close the reply drawer if open
  useMobileBackHandler(replyingTo !== null, () => {
    setReplyingTo(null);
    setReplyText('');
  });

  const selectedReview = replyingTo !== null ? reviews.find(r => r.id === replyingTo) || null : null;

  const sortOptions = [
    { value: 'relevant', label: 'Most Relevant' },
    { value: 'recent', label: 'Most Recent' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#F7F7F7] overflow-hidden md:hidden">
      {/* Main Content Area - Scrollable */}
      <PullToRefresh
        ref={scrollContainerRef}
        onRefresh={async () => onRefresh()}
        className="flex-1 overflow-y-auto px-3 py-0 relative bg-[#F7F7F7] no-scrollbar"
        pullText="Pull to refresh reviews"
        releaseText="Release to refresh"
        refreshingText="Loading new reviews..."
        usePortal={false}
      >
        <div className="space-y-4 pb-32">
          {/* Mobile Header - Profile Sub-header Style - Sticky inside to enable blur/mask effects */}
          <div className="sticky top-0 z-50 bg-[#F7F7F7]/85 backdrop-blur-md py-3 mb-2 -mx-3 px-3 flex items-center justify-between shrink-0 max-md:[mask-image:linear-gradient(to_bottom,black_85%,transparent)]">
            <div className="flex items-center gap-4 pl-1">
              <div>
                <h1 className="text-2xl font-bold leading-tight text-[#1A1A1A] font-anton uppercase tracking-tight">
                  REVIEWS & FEEDBACKS
                </h1>
                {unrepliedCount > 0 ? (
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-lg bg-gray-200 text-gray-700 text-[10px] font-semibold uppercase tracking-tight">
                    {unrepliedCount} unreplied
                  </span>
                ) : (
                  <p className="text-[10px] font-medium text-gray-500 mt-0.5 line-clamp-1">
                    Customer Feedback
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 h-9 bg-[var(--primary)] text-[#1A1A1A] rounded-full shadow-sm flex-shrink-0">
              <span className="text-base font-anton font-bold leading-none">
                {averageRating > 0 ? averageRating.toFixed(1).replace('.', ',') : '0,0'}
              </span>
              <Star className="w-4 h-4 fill-[#1A1A1A] text-[#1A1A1A]" />
            </div>
          </div>

          <div className="space-y-4 px-1">
            {/* Rating Filter Badges (Horizontal scroll) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
              <button
                onClick={() => setSelectedRating(null)}
                className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-2 rounded-2xl text-[11px] tracking-tight transition-all border-2 ${selectedRating === null
                  ? 'bg-[var(--primary)] border-[var(--primary)] text-[#1A1A1A] font-bold shadow-md shadow-[var(--primary)]/10'
                  : 'bg-white border-gray-100 text-gray-500 font-medium hover:border-gray-200'
                  }`}
              >
                <span className="uppercase font-bold tracking-tight">All</span>
                <span className="opacity-60 text-[9px] font-semibold mt-0.5 tracking-tight">{totalReviews} Reviews</span>
              </button>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistributionDisplay.find(d => d.stars === stars)?.count || 0;
                return (
                  <button
                    key={stars}
                    onClick={() => setSelectedRating(selectedRating === stars ? null : stars)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-2 rounded-2xl text-[11px] tracking-tight transition-all border-2 ${selectedRating === stars
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-[#1A1A1A] font-bold shadow-md shadow-[var(--primary)]/10'
                      : 'bg-white border-gray-100 text-gray-500 font-medium hover:border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{stars}</span>
                      <Star className={`w-2.5 h-2.5 ${selectedRating === stars ? 'fill-[#1A1A1A] text-[#1A1A1A]' : 'text-gray-400'}`} />
                    </div>
                    <span className="opacity-60 text-[9px] font-semibold mt-0.5 tracking-tight">{count} Reviews</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {/* Header row with search and sort dropdown */}
              <div className="flex items-center justify-between pl-2 min-h-12 relative overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {isSearchOpen ? (
                    <motion.div
                      key="search-bar"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 w-full pr-1"
                    >
                      <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-lime-500 transition-colors pointer-events-none" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search reviews..."
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
                      key="sort-and-count"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center justify-between w-full"
                    >
                      <h2 className="text-sm font-bold text-gray-900">
                        {reviews.length} reviews
                      </h2>

                      <div className="flex items-center gap-2">
                        {/* Search trigger button */}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsSearchOpen(true)}
                          className={`w-10 h-10 rounded-[17px] border-2 flex items-center justify-center transition-all ${searchQuery
                            ? 'bg-lime-500 border-lime-400 text-white shadow-md shadow-lime-500/20'
                            : 'bg-slate-50 border-white text-gray-600 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] hover:border-[var(--primary)]/20'
                            }`}
                          title="Search reviews"
                        >
                          <Search size={16} strokeWidth={2.8} />
                        </motion.button>

                        <div className="relative shrink-0" ref={sortRef}>
                          <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="group flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-2 border-white rounded-[20px] text-xs font-bold hover:border-[var(--primary)]/20 transition-all text-[#1A1A1A] min-w-[140px] justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-[var(--primary)]/5"
                          >
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isSortOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
                            <div className="w-px h-3 bg-gray-200" />
                            <span className="tracking-tight">{sortOptions.find(o => o.value === sortBy)?.label}</span>
                          </button>

                          <AnimatePresence>
                            {isSortOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-[calc(100%+8px)] w-40 bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden py-2"
                              >
                                {sortOptions.map(option => (
                                  <button
                                    key={option.value}
                                    onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                                    className={`w-full text-left px-5 py-3.5 text-sm font-bold transition-all ${sortBy === option.value
                                      ? 'bg-gray-50 text-black'
                                      : 'text-gray-600 hover:bg-gray-50'
                                      }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shimmer loading, empty states, or reviews list */}
              {isLoading ? (
                <div className="pt-2 px-2">
                  <ReviewItemShimmer count={3} />
                </div>
              ) : reviews.length === 0 ? (
                <EmptyState
                  icon={searchQuery ? Search : MessageSquare}
                  title={searchQuery ? 'No results found' : 'No reviews yet'}
                  description={searchQuery
                    ? `No reviews found matching keyword "${searchQuery}"`
                    : 'Your restaurant has no customer reviews yet.'
                  }
                  className="py-16"
                  buttonText={searchQuery || selectedRating !== null ? 'Clear Filters' : undefined}
                  onButtonClick={() => {
                    setSearchQuery('');
                    setSelectedRating(null);
                  }}
                />
              ) : (
                <div className="space-y-6 pt-2 px-2">
                  {reviews.map((review, index) => {
                    const isLast = index === reviews.length - 1;
                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`space-y-2 md:space-y-3 pb-4 md:pb-6 border-b border-gray-200/90 ${isLast ? 'border-b-0' : ''}`}
                      >
                        {/* Author Avatar & Info */}
                        <div className="flex items-start gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <ImageWithFallback
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.authorName}`}
                              alt={review.authorName}
                              fill
                              placeholderMode="horizontal"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-grow flex-1 min-w-0">
                            <div className="font-bold text-[#1A1A1A] text-sm leading-tight tracking-tight">{review.authorName}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {loadingOrderId === review.orderId ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-gray-500 font-medium border-b border-dashed border-gray-500/40 pb-0.5">
                                    Order #{review.orderId}
                                  </span>
                                  <div className="w-3 h-3 border-2 border-lime-600/30 border-t-lime-600 rounded-full animate-spin shrink-0" />
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleOpenOrder(review.orderId)}
                                  className="text-xs text-gray-500 font-medium border-b border-dashed border-gray-500/40 pb-0.5 active:opacity-70 transition-opacity"
                                >
                                  Order #{review.orderId}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Rating & Date */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(review.rating) ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-400 font-medium tracking-tight text-xs">{review.date}</span>
                        </div>

                        {/* Review Content */}
                        <p className="font-medium text-[#1A1A1A] leading-relaxed text-[15px] tracking-tight">
                          {review.content}
                        </p>

                        {/* Admin Reply - Airbnb style nested flat layout */}
                        {review.reply ? (
                          <div className="mt-4 pl-2 space-y-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200/60 flex items-center justify-center text-gray-500 shrink-0">
                                <ChefHat className="w-4 h-4 text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#1A1A1A] leading-tight tracking-tight">Response from host</div>
                                <div className="text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">{review.date}</div>
                              </div>
                            </div>
                            <p className="font-medium text-[#1A1A1A] leading-relaxed text-[14px] pl-[42px] tracking-tight">
                              {review.reply}
                            </p>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setReplyingTo(review.id);
                                setReplyText('');
                              }}
                              className="flex flex-col items-start gap-0.5 active:scale-95 transition-all text-left"
                            >
                              <div className="flex items-center gap-1 text-lime-600">
                                <span className="text-[12px] font-bold border-b-2 border-dotted border-lime-500/40 pb-0.5 tracking-tight">Write your response now</span>
                                <ChevronRight className="w-3.5 h-3.5 text-lime-600" strokeWidth={3} />
                              </div>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* End of list label */}
                  {reviews.length >= 3 && (
                    <div className="py-8 flex items-center justify-center gap-4 opacity-40">
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent w-16" />
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase font-anton tracking-widest text-center">
                          End of list
                        </span>
                      </div>
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent w-16" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </PullToRefresh>

      {/* MOBILE REPLY BOTTOM DRAWER */}
      <AnimatePresence>
        {replyingTo !== null && selectedReview && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setReplyingTo(null); setReplyText(''); }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] md:hidden"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 18, stiffness: 100 }}
              className="fixed bottom-0 left-0 right-0 z-[90] bg-[#F8F9FA] rounded-t-[40px] overflow-hidden max-h-[94vh] flex flex-col shadow-2xl border-t border-white/20 md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100 bg-white">
                <div>
                  <h2 className="text-2xl font-bold font-anton text-[#1A1A1A] uppercase">
                    REPLY TO REVIEW
                  </h2>
                  <div className="text-gray-500 text-xs font-semibold mt-0.5 flex items-center gap-2 tracking-tight">
                    <span>Order ID: #{selectedReview.orderId} • {selectedReview.authorName}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setReplyingTo(null); setReplyText(''); }}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 pb-28">
                {/* The Review Card */}
                <div className="bg-white rounded-[32px] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100/50">
                  <div className="flex items-start gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedReview.authorName}`}
                        alt={selectedReview.authorName}
                        fill
                        placeholderMode="horizontal"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow flex-1 min-w-0">
                      <div className="font-bold text-[#1A1A1A] text-sm leading-tight tracking-tight">{selectedReview.authorName}</div>
                      <div className="text-xs text-gray-500 font-semibold mt-0.5 tracking-tight">Order #{selectedReview.orderId}</div>
                    </div>
                  </div>

                  {/* Rating & Date */}
                  <div className="flex items-center gap-2 text-xs mt-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(selectedReview.rating) ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400 font-medium tracking-tight text-xs">{selectedReview.date}</span>
                  </div>

                  {/* Review Content */}
                  <p className="font-medium text-[#1A1A1A] leading-relaxed text-[14px] mt-3 italic tracking-tight">
                    "{selectedReview.content}"
                  </p>
                </div>

                {/* Input Form */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    Your Response
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to this customer..."
                    rows={5}
                    className="w-full bg-white rounded-3xl border border-gray-200 p-4 text-sm font-medium text-[#1A1A1A] tracking-tight focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/5 resize-none shadow-sm transition-all"
                    disabled={isReplying}
                  />
                </div>
              </div>

              {/* Sticky Actions Footer */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 rounded-t-[32px] shrink-0 z-20">
                <motion.button
                  whileTap={isReplying || !replyText.trim() ? {} : { scale: 0.98 }}
                  onClick={async () => {
                    await handleReply(selectedReview.id);
                  }}
                  disabled={isReplying || !replyText.trim()}
                  className={`w-full py-3.5 rounded-3xl font-bold text-base tracking-tight shadow-lg transition-all flex items-center justify-center gap-3 ${isReplying || !replyText.trim()
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-lime-500 text-white shadow-lime-500/30 hover:bg-lime-600"
                    }`}
                >
                  {isReplying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Response</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE HISTORY DRAWER FOR INLINE ORDER LOGS */}
      <MobileHistoryDrawer
        open={isOrderDrawerOpen}
        order={selectedOrderDetails}
        onClose={() => {
          setIsOrderDrawerOpen(false);
          setTimeout(() => {
            clearOrder();
          }, 300);
        }}
      />
    </div>
  );
}
