"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "@repo/ui/motion";
import { useBottomNav } from "@/app/(protected)/(normal)/context/BottomNavContext";
import StoreHeader from "../StoreHeader";
import StoreGeneralInfo from "../StoreGeneralInfo";
import StoreLocation from "../StoreLocation";
import StoreSchedule from "../StoreSchedule";
import StoreGeneralInfoEdit from "../StoreGeneralInfoEdit";
import StoreLocationEdit from "../StoreLocationEdit";
import StoreScheduleEdit from "../StoreScheduleEdit";

interface MobileStoreProps {
  store: any;
  onUpdateStore: (updates: Record<string, any>) => Promise<void>;
}

export default function MobileStore({ store, onUpdateStore }: MobileStoreProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'location' | 'schedule' | null>(null);

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

  const handleSave = async (updates: Record<string, any>) => {
    await onUpdateStore(updates);
    setActiveSection(null);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F7F7F7] overflow-hidden md:hidden">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pb-32 no-scrollbar"
      >
        {/* Reusable Responsive Store Header */}
        <StoreHeader store={store} isMobile={true} />

        {/* Main Content Sections Stacked */}
        <div className="px-4 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StoreGeneralInfo
              store={store}
              onEdit={() => setActiveSection('general')}
              layoutId="store-card-general-mobile"
              isMobile={true}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StoreLocation
              store={store}
              onEdit={() => setActiveSection('location')}
              layoutId="store-card-location-mobile"
              isMobile={true}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StoreSchedule
              store={store}
              onEdit={() => setActiveSection('schedule')}
              layoutId="store-card-schedule-mobile"
              isMobile={true}
            />
          </motion.div>
        </div>
      </div>

      {/* Slide up edit drawers for mobile viewports */}
      <AnimatePresence>
        {activeSection && (
          <motion.div
            key="mobile-store-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveSection(null)}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSection === 'general' && (
          <StoreGeneralInfoEdit
            key="mobile-store-edit-general"
            store={store}
            onSave={handleSave}
            onClose={() => setActiveSection(null)}
            isMobile={true}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSection === 'location' && (
          <StoreLocationEdit
            key="mobile-store-edit-location"
            store={store}
            onSave={handleSave}
            onClose={() => setActiveSection(null)}
            isMobile={true}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSection === 'schedule' && (
          <StoreScheduleEdit
            key="mobile-store-edit-schedule"
            store={store}
            onSave={handleSave}
            onClose={() => setActiveSection(null)}
            isMobile={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
