'use client';

import { useEffect, useRef } from 'react';
import { motion } from '@repo/ui/motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  UtensilsCrossed,
  History,
  Star,
  Store,
  BarChart3,
  Wallet,
  User,
} from '@repo/ui/icons';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'orders', icon: ShoppingCart, text: 'Đơn hàng', path: '/orders' },
    { id: 'menu', icon: UtensilsCrossed, text: 'Thực đơn', path: '/menu' },
    { id: 'history', icon: History, text: 'Lịch sử', path: '/history' },
    { id: 'reviews', icon: Star, text: 'Đánh giá', path: '/reviews' },
    { id: 'store', icon: Store, text: 'Cửa hàng', path: '/store' },
    { id: 'reports', icon: BarChart3, text: 'Báo cáo', path: '/reports' },
    { id: 'wallet', icon: Wallet, text: 'Ví', path: '/wallet' },
    { id: 'profile', icon: User, text: 'Tài khoản', path: '/profile' }
  ];

  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const activeOffsetLeft = (activeEl as HTMLElement).offsetLeft;
        const activeWidth = (activeEl as HTMLElement).clientWidth;

        container.scrollTo({
          left: activeOffsetLeft - containerWidth / 2 + activeWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [pathname]);

  return (
    <div className="md:hidden fixed bottom-2 left-2 right-2 z-[50] pointer-events-none">
      <motion.div
        className="pointer-events-auto backdrop-blur-xl bg-white/70 text-black rounded-[32px] border border-white/40 px-2 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 flex items-center justify-between overflow-hidden w-full relative"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
      >
        {/* Soft edge fade indicator for horizontal scroll */}
        <div className="absolute left-2 top-0 bottom-0 w-6 bg-gradient-to-r from-white/20 to-transparent pointer-events-none z-20" />
        <div className="absolute right-2 top-0 bottom-0 w-6 bg-gradient-to-l from-white/20 to-transparent pointer-events-none z-20" />

        <div
          ref={containerRef}
          className="flex overflow-x-auto scrollbar-none py-2 w-full scroll-smooth select-none"
        >
          {tabs.map((tab) => {
            const isActive = tab.path === '/orders'
              ? (pathname === '/orders' || pathname === '/' || pathname === '')
              : pathname?.includes(tab.path);
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                data-active={isActive}
                initial={false}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 180, damping: 10 }}
                onClick={() => router.replace(tab.path)}
                className="flex flex-col items-center justify-center w-1/5 flex-shrink-0 h-[60px] gap-0 outline-none select-none"
              >
                <div className={`flex items-center justify-center rounded-full transition-all duration-300 relative z-10
                  ${tab.id === 'orders'
                    ? (isActive ? 'w-14 h-14 mx-3 bg-black text-white shadow-lg scale-110 flex-shrink-0' : 'w-14 h-14 mx-3 bg-white/20 text-gray-400 shadow-md scale-110 flex-shrink-0 border border-white/70')
                    : (isActive ? 'w-12 h-12 bg-black text-white shadow-md scale-110' : 'w-12 h-12 text-gray-400 active:bg-gray-200/50 active:scale-95')
                  }`}
                >
                  <div className="relative">
                    <Icon className={tab.id === 'orders' ? "w-7 h-7" : "w-6 h-6"} strokeWidth={2.5} />
                  </div>
                </div>
                {tab.id !== 'orders' && (
                  <span className={`text-[10px] font-bold whitespace-nowrap text-gray-400 relative z-20 transition-all duration-300 ${isActive ? 'mt-1 text-black' : 'mt-[-5px]'}`}>
                    {tab.text}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
