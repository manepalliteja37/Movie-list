import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-label="Add Movie to Watchlist"
      title="Add Movie to Watchlist (Press A or +)"
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-8 right-4 sm:right-6 lg:right-8 z-40 group cursor-pointer flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-[#C41E3A] hover:bg-[#D92546] active:bg-[#B91C1C] text-white shadow-[0_8px_28px_rgba(196,30,58,0.55)] border-2 border-[#FF6B81]/40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#C41E3A]/40"
    >
      {/* Ambient Pulsing Glow Ring */}
      <span className="absolute inset-0 rounded-full bg-[#C41E3A] animate-ping opacity-20 pointer-events-none group-hover:opacity-35" />

      {/* Film Sprocket Perforations around the perimeter for cinematic aesthetic */}
      <span className="absolute top-1.5 w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none" />
      <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none" />
      <span className="absolute left-1.5 w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none" />
      <span className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none" />

      {/* Prominent White Center Circle (High contrast, clearly visible) */}
      <div className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.35)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
        {/* Bold, Razor-Sharp Plus Icon in Crimson */}
        <Plus
          size={20}
          className="stroke-[3.5] text-[#C41E3A] transition-transform duration-300 group-hover:rotate-90"
          aria-hidden="true"
        />
      </div>

      {/* Floating Tooltip for Desktop */}
      <span className="hidden lg:group-hover:inline-block absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-[#14141C] text-[#F5F5DC] text-xs font-poster tracking-wider uppercase border border-[#28283C] shadow-xl whitespace-nowrap pointer-events-none">
        Add Movie (+)
      </span>
    </button>
  );
};
