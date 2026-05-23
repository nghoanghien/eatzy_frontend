"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to handle mobile back button for overlays/drawers.
 * When enabled (isOpen is true and is mobile), it pushes a state to history.
 * If the user presses back, it calls onBack (closing the overlay).
 * If the overlay is closed programmatically (e.g. X button), it pops the added history entry.
 */
export function useMobileBackHandler(isOpen: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const isBackTriggeredRef = useRef(false);
  const stateIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only handle on mobile (desktop follows normal browser flow)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (!isMobile) return;

    if (isOpen) {
      // OPENING: push a unique history state
      const stateId = `mb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      stateIdRef.current = stateId;
      window.history.pushState({ mobileBackId: stateId }, "");
      isBackTriggeredRef.current = false;

      const handlePopState = (e: PopStateEvent) => {
        // If we landed on a state that is NOT our stateId, a back action occurred
        if (e.state?.mobileBackId !== stateId) {
          isBackTriggeredRef.current = true;
          onBackRef.current();
        }
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);

        // If closed programmatically (not via back button), clean up the history entry
        if (!isBackTriggeredRef.current) {
          if (window.history.state?.mobileBackId === stateId) {
            window.history.back();
          }
        }
        isBackTriggeredRef.current = false;
        stateIdRef.current = null;
      };
    }
  }, [isOpen]);
}
