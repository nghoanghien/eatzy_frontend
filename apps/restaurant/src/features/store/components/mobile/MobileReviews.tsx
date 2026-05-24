'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from '@repo/ui/motion';
import {
  Search, Star, Sparkles, CheckCircle2, MessageSquare, Map, Tag, ChefHat,
  ChevronDown, Send, X, AlertCircle, ArrowLeft
} from '@repo/ui/icons';
import { ImageWithFallback, ReviewItemShimmer, PullToRefresh } from '@repo/ui';
import { EmptyState } from '@/components/ui/EmptyState';

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
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700 text-[10px] font-semibold uppercase tracking-tight">
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
                className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl text-[10px] font-anton tracking-wider transition-all border-2 ${selectedRating === null
                  ? 'bg-[var(--primary)] border-[var(--primary)] text-[#1A1A1A] shadow-md shadow-[var(--primary)]/10'
                  : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
              >
                <span className="uppercase font-semibold">All</span>
                <span className="opacity-40 text-[9px] leading-tight mt-0.5">{totalReviews} Reviews</span>
              </button>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistributionDisplay.find(d => d.stars === stars)?.count || 0;
                return (
                  <button
                    key={stars}
                    onClick={() => setSelectedRating(selectedRating === stars ? null : stars)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl text-[10px] font-anton tracking-wider transition-all border-2 ${selectedRating === stars
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-[#1A1A1A] shadow-md shadow-[var(--primary)]/10'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{stars}</span>
                      <Star className={`w-2.5 h-2.5 ${selectedRating === stars ? 'fill-[#1A1A1A] text-[#1A1A1A]' : 'text-gray-400'}`} />
                    </div>
                    <span className="opacity-40 text-[9px] leading-tight mt-0.5">{count} Reviews</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {/* Header row with sort dropdown */}
              <div className="flex items-center justify-between pl-2">
                <h2 className="text-sm font-bold text-gray-900">
                  {reviews.length} reviews
                </h2>

                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-2 border-white rounded-[20px] text-xs font-bold hover:border-[var(--primary)]/20 transition-all text-[#1A1A1A] min-w-[140px] justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-[var(--primary)]/5"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isSortOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
                      <div className="w-px h-3 bg-gray-200" />
                      <span className="tracking-tight">{sortOptions.find(o => o.value === sortBy)?.label}</span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, type: 'spring', damping: 20, stiffness: 300 }}
                        className="absolute right-0 top-full mt-3 w-56 bg-white rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-white p-2 z-30 overflow-hidden"
                      >
                        {sortOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-xs rounded-xl transition-all flex items-center justify-between mb-1 last:mb-0 ${sortBy === option.value
                              ? 'text-[var(--primary)] font-bold bg-[var(--primary)]/10'
                              : 'text-gray-700 hover:bg-slate-50 font-medium'
                              }`}
                          >
                            <span className={sortBy === option.value ? 'font-bold px-1' : 'font-medium'}>
                              {option.label}
                            </span>
                            {sortBy === option.value && <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_10px_rgba(255,190,0,0.5)]" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Search Bar - Matches customer app detail reviews style focus effects */}
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
                  <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search reviews by content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-white focus:border-[var(--primary)]/20 rounded-3xl py-4 pl-14 pr-12 text-lg font-bold font-anton text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/5 transition-all shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all group/close"
                  >
                    <X className="w-4 h-4 text-gray-600 group-hover/close:rotate-90 transition-transform duration-300" />
                  </button>
                )}
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
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-grow flex-1 min-w-0">
                            <div className="font-bold text-gray-900 text-sm">{review.authorName}</div>
                            <div className="text-xs text-gray-500 font-medium">Order #{review.orderId}</div>
                          </div>
                        </div>

                        {/* Rating & Date */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-500 font-medium">{review.date}</span>
                        </div>

                        {/* Review Content */}
                        <p className="text-gray-700 leading-relaxed text-[15px] font-medium tracking-tight">
                          {review.content}
                        </p>

                        {/* Admin Reply or Reply Form */}
                        {review.reply ? (
                          <div className="mt-4 p-4 bg-gray-50 rounded-2xl border-l-4 border-[var(--primary)] space-y-0">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                              <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-white">
                                <ChefHat size={12} />
                              </div>
                              Response from host
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed italic pl-1 mt-1">
                              "{review.reply}"
                            </p>
                          </div>
                        ) : replyingTo === review.id ? (
                          <div className="mt-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                className="flex-1 px-4 py-3 text-xs bg-slate-50 border-2 border-white rounded-xl focus:border-[var(--primary)]/20 focus:ring-4 focus:ring-[var(--primary)]/5 focus:outline-none transition-all"
                                disabled={isReplying}
                              />
                              <button
                                onClick={() => handleReply(review.id)}
                                disabled={isReplying || !replyText.trim()}
                                className="px-4 py-3 bg-lime-500 text-white rounded-xl font-bold text-xs hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isReplying ? '...' : 'Send'}</span>
                              </button>
                              <button
                                onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(review.id)}
                            className="mt-3 flex items-center gap-2 text-xs font-bold text-lime-600 hover:text-lime-700 transition-colors py-1 px-2 hover:bg-lime-55/10 rounded-lg w-fit"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Reply to review
                          </button>
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
    </div>
  );
}
