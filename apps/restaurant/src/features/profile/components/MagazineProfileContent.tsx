"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "@repo/ui/motion";
import {
  User, ShieldCheck, HelpCircle,
  LogOut, ChevronRight
} from "@repo/ui/icons";
import { ImageWithFallback, useHoverHighlight, HoverHighlightOverlay } from "@repo/ui";
import { useUserProfile } from "../hooks/useUserProfile";
import PersonalInfoSection from "./sections/PersonalInfoSection";

export default function MagazineProfileContent({ onLogout }: { onLogout: () => void }) {
  const [activeId, setActiveId] = useState("01");
  const { user, isLoading } = useUserProfile();
  const { containerRef, rect, style, moveHighlight, clearHover } = useHoverHighlight<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeId]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full border-4 border-lime-100 border-t-lime-500 animate-spin" />
        <p className="text-gray-400 font-medium mt-4">Loading profile...</p>
      </div>
    );
  }

  const userAny = user as any;
  const displayName = userAny.name || "Merchant Owner";
  const displayEmail = userAny.email || "owner.eatzy@gmail.com";
  const avatarUrl = userAny.avatar || "";

  const menuSections = [
    {
      title: "Account Settings",
      items: [
        { id: "01", icon: User, label: "Personal Info" },
      ]
    },
    {
      title: "Support & App",
      items: [
        { id: "06", icon: HelpCircle, label: "Help Center" },
      ]
    }
  ];

  const renderContent = () => {
    if (activeId === "01") {
      return <PersonalInfoSection user={user} />;
    }

    if (activeId === "06") {
      return (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Eatzy Merchant Help Center</h3>
          <p className="text-gray-500 font-medium">Need help with your account or order management? Contact us.</p>
          <div className="p-6 bg-slate-50 rounded-[24px] border border-gray-100 space-y-4">
            <h4 className="font-bold text-gray-900">Finance & Operations Support</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Email: merchant-support@eatzy.com<br />
              Hotline: 1900 8888 (24/7 Support)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col md:grid md:grid-cols-[350px_1fr] gap-4 py-2 h-[calc(100vh-140px)]">
      {/* LEFT COLUMN: Sidebar Navigation */}
      <div className="flex flex-col h-full gap-4">
        {/* User Quick Info */}
        <div className="bg-white rounded-[32px] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 flex items-center gap-5 relative overflow-hidden group">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#F7F7F7] shadow-xl relative z-10 transition-transform group-hover:scale-105 duration-500">
              <ImageWithFallback src={avatarUrl} alt={displayName} fill className="object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-lime-500 text-white rounded-xl border-4 border-white flex items-center justify-center shadow-lg z-20">
              <ShieldCheck size={12} strokeWidth={3} />
            </div>
          </div>

          <div className="text-left relative z-10 min-w-0 flex-1">
            <h2 className="text-xl font-anton font-bold text-[#1A1A1A] leading-tight mb-1 truncate uppercase">
              {displayName}
            </h2>
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="text-[13px] font-medium truncate opacity-80">
                {displayEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Card */}
        <div ref={containerRef} className="bg-white rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 relative flex-1 flex flex-col overflow-hidden">
          <HoverHighlightOverlay rect={rect} style={style} />

          {/* Scrollable Menu Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar pt-3 px-3">
            <div className="relative z-10 w-full space-y-1">
              {menuSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-5 py-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{section.title}</span>
                  </div>

                  {section.items.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveId(item.id)}
                      whileTap={{ scale: 0.96 }}
                      onMouseEnter={(e) => moveHighlight(e, {
                        borderRadius: 24,
                        backgroundColor: "rgba(0,0,0,0.04)",
                        scaleEnabled: false
                      })}
                      onMouseLeave={clearHover}
                      className={`w-full flex items-center gap-4 px-5 py-2 rounded-[24px] transition-all relative z-10 group active:scale-[0.96] ${activeId === item.id ? 'text-[#1A1A1A] bg-slate-100' : 'text-gray-500'
                        }`}
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeId === item.id ? 'bg-slate-200 text-black' : 'bg-slate-50 text-gray-400 group-hover:bg-slate-100 group-hover:text-[#1A1A1A]'
                        }`}>
                        <item.icon className="w-5 h-5" />
                      </div>

                      <span className={`flex-1 text-left text-base font-bold transition-all ${activeId === item.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                        }`}>
                        {item.label}
                      </span>

                      <ChevronRight className={`w-4 h-4 transition-all duration-300 ${activeId === item.id ? 'text-[#1A1A1A] translate-x-0' : 'text-gray-200 group-hover:text-gray-400 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                        }`} />
                    </motion.button>
                  ))}

                  {idx === 0 && <div className="h-px bg-gray-50 mx-4 my-2" />}
                </div>
              ))}
            </div>
          </div>

          {/* Fixed Bottom Area */}
          <div className="relative z-10 mt-auto p-3 bg-white">
            <div className="h-px bg-gray-100 mx-4 mb-2" />

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-5 py-3 rounded-[24px] text-red-500 hover:bg-red-50 transition-all group relative z-10"
              onMouseEnter={(e) => moveHighlight(e, {
                borderRadius: 24,
                backgroundColor: "rgba(239, 68, 68, 0.05)",
                scaleEnabled: false
              })}
              onMouseLeave={clearHover}
            >
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center transition-all group-hover:bg-red-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-500/20">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left text-base font-bold">
                Log Out
              </span>
              <ChevronRight className="w-4 h-4 text-red-200 group-hover:translate-x-0 transition-all -translate-x-1 opacity-0 group-hover:opacity-100" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Main Content Area */}
      <div
        ref={contentRef}
        className="flex-1 bg-white rounded-[44px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100/50 p-8 h-full relative overflow-y-auto overflow-x-hidden no-scrollbar backdrop-blur-3xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full relative z-10"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
