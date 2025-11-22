import { useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "../motion";

type Ripple = { x: number; y: number; size: number; id: number } | null;

export function useTapRipple<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const [ripple, setRipple] = useState<Ripple>(null);

  const triggerTap = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (e.clientX ?? 0) - rect.left;
    const y = (e.clientY ?? 0) - rect.top;
    const size = Math.max(rect.width, rect.height) * 1.4;
    setRipple({ x, y, size, id: Date.now() });
    setTimeout(() => setRipple(null), 700);
  }, []);

  return { containerRef, ripple, triggerTap };
}

export function TapRippleOverlay({ ripple }: { ripple: Ripple }) {
  return (
    <AnimatePresence>
      {ripple && (
        <motion.div
          key={ripple.id}
          initial={{ opacity: 0.28, scale: 0 }}
          animate={{ opacity: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          className="absolute pointer-events-none z-20 rounded-full"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0) 65%), radial-gradient(ellipse at center, var(--primary) 0%, rgba(120,200,65,0.24) 30%, rgba(120,200,65,0) 70%)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.4) inset, 0 20px 60px rgba(0,0,0,0.25)",
          }}
        />
      )}
    </AnimatePresence>
  );
}