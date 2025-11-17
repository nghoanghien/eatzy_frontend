"use client";

export default function ScrollToTopButton({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 z-50 p-3 bg-[var(--primary)] rounded-full shadow-lg transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}`}
    >
      <div className="absolute inset-0 rounded-full animate-pulse-ring opacity-0"></div>
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-white/20 rounded-full"></div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
      </div>
    </button>
  );
}