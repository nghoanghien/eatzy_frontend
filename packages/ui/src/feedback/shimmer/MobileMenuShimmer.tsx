'use client';

import { motion } from "@repo/ui/motion";
import { Search, Plus, Settings } from "lucide-react";

export default function MobileMenuShimmer() {
  const shimmerVariants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
      backgroundPosition: '200% 0',
      transition: {
        duration: 2,
        ease: 'linear',
        repeat: Infinity,
      },
    },
  };

  const shimmerStyle = {
    background: 'linear-gradient(90deg, #f3f4f6 25%, rgba(255,255,255,0.8) 50%, #f3f4f6 75%)',
    backgroundSize: '200% 100%',
  };

  const darkShimmerStyle = {
    background: 'linear-gradient(90deg, #e5e7eb 25%, rgba(255,255,255,0.8) 50%, #e5e7eb 75%)',
    backgroundSize: '200% 100%',
  };

  return (
    <div className="h-screen flex flex-col bg-[#F8F9FA] overflow-hidden md:hidden">
      {/* Real static Header */}
      <div className="px-3 pt-4 pb-3 shrink-0 bg-white">
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-2xl font-anton font-bold text-gray-900 uppercase tracking-tight leading-none">
              MENU & STOCK
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              className="w-10 h-10 rounded-2xl bg-gray-200/70 border-2 border-gray-200 flex items-center justify-center text-gray-400 shadow-md pointer-events-none"
              title="Categories Manager"
            >
              <Settings size={20} strokeWidth={2.8} />
            </button>
            <button
              className="w-10 h-10 rounded-2xl bg-primary/90 text-white flex items-center justify-center shadow-md shadow-[var(--primary)]/20 pointer-events-none"
              title="Thêm món mới"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs Shimmer */}
      <div className="px-3 py-3 pt-0.5 border-t border-gray-50 flex gap-2 overflow-hidden bg-white shrink-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-2 py-2 rounded-2xl bg-white border-2 border-gray-200 shrink-0 flex items-center gap-1.5 min-w-[90px]">
            <motion.div
              className="h-3 w-12 bg-gray-100 rounded"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              style={shimmerStyle}
            />
            <div className="w-5 h-4 bg-gray-50 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Dish List Shimmer */}
      <div className="flex-1 p-4 py-2 space-y-10 overflow-y-auto no-scrollbar">
        {[1, 2].map((section) => (
          <div key={section} className="space-y-4">
            {/* Section Header Shimmer */}
            <div className="flex items-center gap-4">
              <motion.div
                className="h-6 w-32 bg-gray-200 rounded"
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                style={darkShimmerStyle}
              />
              <div className="h-px flex-1 bg-gray-200" />
              <div className="w-16 h-6 rounded-xl bg-gray-100 border border-gray-200" />
            </div>

            {/* Dish Cards Shimmer */}
            <div className="space-y-3">
              {[1, 2, 3].map((card) => (
                <div key={card} className="relative w-full h-[140px] flex flex-row overflow-hidden rounded-[40px] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
                  {/* Left: Image Shimmer */}
                  <div className="relative w-36 h-full flex-shrink-0 bg-gray-50 overflow-hidden">
                    <motion.div
                      className="h-full w-full"
                      variants={shimmerVariants}
                      initial="initial"
                      animate="animate"
                      style={shimmerStyle}
                    />
                  </div>

                  {/* Right: Info Shimmer */}
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0 pr-12">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-8 h-2 bg-gray-150 rounded" />
                      </div>
                      <motion.div
                        className="h-5 w-3/4 bg-gray-200 rounded-lg"
                        variants={shimmerVariants}
                        initial="initial"
                        animate="animate"
                        style={darkShimmerStyle}
                      />
                      <motion.div
                        className="h-3 w-1/2 bg-gray-150 rounded"
                        variants={shimmerVariants}
                        initial="initial"
                        animate="animate"
                        style={shimmerStyle}
                      />
                    </div>

                    <div className="flex flex-col border-t border-gray-50 pt-2.5">
                      <div className="w-8 h-2 bg-gray-150 rounded mb-1.5" />
                      <motion.div
                        className="h-5 w-24 bg-gray-200 rounded-lg"
                        variants={shimmerVariants}
                        initial="initial"
                        animate="animate"
                        style={darkShimmerStyle}
                      />
                    </div>
                  </div>

                  {/* Action Buttons Shimmer */}
                  <div className="absolute bottom-3 right-3 flex gap-1.5">
                    <div className="w-9 h-9 rounded-2xl bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
