"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "@repo/ui/motion";
import { useSwipeConfirmation, useLoading } from "@repo/ui";
import { useRouter } from "next/navigation";
import {
  User, CreditCard, ShieldCheck,
  LogOut, Bell, HelpCircle, ArrowLeft
} from "@repo/ui/icons";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";
import RestaurantProfileCard from "@/features/profile/components/RestaurantProfileCard";
import ProfileMenuItem from "@/features/profile/components/ProfileMenuItem";
import PersonalInfoSection from "@/features/profile/components/sections/PersonalInfoSection";
import MagazineProfileContent from "@/features/profile/components/MagazineProfileContent";
import { useMobileBackHandler } from "@/hooks/useMobileBackHandler";
import { PullToRefresh } from "@repo/ui";
import { useLogout } from "@/features/auth/hooks/useLogout";

type MobileSection = 'personal';

export default function ProfilePage() {
  const router = useRouter();
  const { confirm } = useSwipeConfirmation();
  const { show, hide } = useLoading();
  const { user, refresh, isUpdating } = useUserProfile();
  const { handleLogout: performLogout } = useLogout();

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<MobileSection | null>(null);

  useMobileBackHandler(activeMobileSection !== null, () => {
    setActiveMobileSection(null);
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    confirm({
      title: "Log Out",
      description: "Are you sure you want to log out?",
      confirmText: "Swipe to log out",
      type: "danger",
      onConfirm: async () => {
        show();
        performLogout();
      }
    });
  };

  const driverPageTransition = {
    type: "spring",
    damping: 25,
    stiffness: 180,
    mass: 0.8
  };

  const renderSubPage = () => {
    if (!activeMobileSection) return null;

    return (
      <motion.div
        key="sub-page-outer-container"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={driverPageTransition}
        className="fixed inset-0 z-[100] bg-[#F7F7F7] overflow-hidden"
      >
        <motion.div
          key="standard-sub-content"
          initial={{ x: '-30%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={driverPageTransition}
          className="absolute inset-0 bg-[#F7F7F7] overflow-hidden px-3 h-full w-full"
        >
          <PullToRefresh
            onRefresh={refresh}
            className="flex-1 no-scrollbar overflow-visible"
            pullText="Pull to refresh"
            releaseText="Release to refresh"
            refreshingText="Refreshing..."
          >
            <div className="max-w-xl mx-auto pb-32">
              {/* Header */}
              <div className="sticky top-0 z-50 bg-[#F7F7F7]/95 backdrop-blur-md py-4 mb-2 -mx-3 px-3 max-md:[mask-image:linear-gradient(to_bottom,black_90%,transparent)]">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveMobileSection(null)}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center group flex-shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
                  </button>
                  <div>
                    <h1 className="text-[28px] font-bold leading-tight text-[#1A1A1A] font-anton uppercase tracking-tight">
                      PERSONAL INFO
                    </h1>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">
                      Manage your account details
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-page Content */}
              <div className="px-1 mt-4">
                {activeMobileSection === 'personal' && <PersonalInfoSection user={user} />}
              </div>
            </div>
          </PullToRefresh>
        </motion.div>
      </motion.div>
    );
  };

  if (!mounted) return null;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] overflow-hidden relative">
        <AnimatePresence initial={false}>
          {!activeMobileSection ? (
            <motion.div
              key="main-profile"
              initial={{ x: '-30%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={driverPageTransition}
              className="absolute inset-0"
            >
              <PullToRefresh
                onRefresh={refresh}
                className="max-w-7xl mx-auto px-4 space-y-8 pt-6 pb-[120px] no-scrollbar overflow-visible"
                pullText="Pull to refresh"
                releaseText="Release to refresh"
                refreshingText="Refreshing..."
              >
                <div className="space-y-8 pb-32">
                  {/* Main Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <RestaurantProfileCard user={user} />
                  </motion.div>

                  {/* Account Settings */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pl-2">Account</h3>
                    <div className="space-y-2">
                      <ProfileMenuItem
                        icon={<User className="w-5 h-5" />}
                        label="Personal Info"
                        subLabel="Edit Profile"
                        onClick={() => setActiveMobileSection('personal')}
                      />
                      <ProfileMenuItem
                        icon={<CreditCard className="w-5 h-5" />}
                        label="Wallet & Payment"
                        subLabel="Withdraw, transactions history"
                        onClick={() => router.push('/wallet')}
                      />
                    </div>
                  </motion.div>

                  {/* App Settings */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pl-2">App</h3>
                    <div className="space-y-2">
                      <ProfileMenuItem icon={<Bell className="w-5 h-5" />} label="Notification Settings" />
                      <ProfileMenuItem icon={<ShieldCheck className="w-5 h-5" />} label="Security & Privacy" />
                      <ProfileMenuItem icon={<HelpCircle className="w-5 h-5" />} label="Help Center" />
                    </div>
                  </motion.div>

                  {/* Logout */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <ProfileMenuItem
                      icon={<LogOut className="w-5 h-5" />}
                      label="Log Out"
                      subLabel="Version 2.4.8"
                      isDestructive
                      onClick={handleLogout}
                    />
                  </motion.div>
                </div>
              </PullToRefresh>
            </motion.div>
          ) : (
            renderSubPage()
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] pt-8 md:pt-5 pb-40 md:pb-0 overflow-hidden">
      <div className="w-full px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="mb-5 shrink-0 px-1">
            <div className="flex items-center gap-2 mb-2">
            </div>
            <h1 className="text-4xl font-anton text-gray-900 uppercase tracking-tight leading-none">
              PERSONAL INFO
            </h1>
          </div>
          <MagazineProfileContent onLogout={handleLogout} />
        </motion.div>
      </div>
    </div>
  );
}
