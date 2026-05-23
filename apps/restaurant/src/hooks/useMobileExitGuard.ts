"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sileo } from "@/components/DynamicIslandToast";

/**
 * Custom hook to handle "double back to exit" behavior on mobile.
 * Covers the main tabs of the Restaurant app and the login page.
 */
export function useMobileExitGuard() {
  const pathname = usePathname();
  const lastBackPressTime = useRef<number>(0);

  useEffect(() => {
    // Enable for mobile/tablets (< 1024px)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (!isMobile) return;

    // Main tabs for the restaurant app
    const mainTabs = ["/orders", "/menu", "/history", "/reviews", "/store", "/reports", "/wallet", "/login"];
    const isMainTab = mainTabs.includes(pathname || "");
    if (!isMainTab) return;

    // Push dummy state to capture back button.
    // Small delay to let Next.js routing stabilize.
    const timeoutId = setTimeout(() => {
      window.history.pushState({ isExitGuard: true }, "");
    }, 150);

    const handlePopState = (event: PopStateEvent) => {
      // If a drawer/modal is using useMobileBackHandler, it pushes a mobileBackId state.
      // We must NOT trigger exit logic when that is the active state.
      const isOverlayOpen =
        typeof document !== "undefined" &&
        document.body.classList.contains("modal-open");
      if (event.state?.mobileBackId || isOverlayOpen) return;

      if (!event.state || !event.state.isExitGuard) {
        const now = Date.now();

        if (now - lastBackPressTime.current < 2000) {
          // Second back press within 2s → exit
          window.close();
          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.history.back();
            }
          }, 100);
        } else {
          // First back press
          lastBackPressTime.current = now;
          window.history.pushState({ isExitGuard: true }, "");

          sileo.warning({
            title: "Press back again to exit",
            description: "",
          });
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      clearTimeout(timeoutId);

      // Cleanup guard state when navigating away
      if (window.history.state?.isExitGuard) {
        window.history.back();
      }
    };
  }, [pathname]);
}
