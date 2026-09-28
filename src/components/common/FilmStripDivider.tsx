import React from 'react';
import { FilmReelIcon } from './CinematicIcons';

interface FilmStripDividerProps {
  className?: string;
  label?: string;
  animated?: boolean;
}

export const FilmStripDivider: React.FC<FilmStripDividerProps> = ({
  className = '',
  label,
  animated = true,
}) => {
  return (
    <div className={`relative w-full my-8 select-none filmstrip-container ${className}`}>
      {/* Top Sprocket Holes Track (Continuous Slow Train Marquee Motion if animated) */}
      <div className="filmstrip-sprocket-bar h-4 sm:h-5 w-full flex items-center overflow-hidden border-y shadow-md relative">
        <div className={`flex gap-2 sm:gap-3 shrink-0 min-w-max ${animated ? 'animate-sprocket-track' : ''}`}>
          <div className="flex gap-2 sm:gap-3 shrink-0">
            {Array.from({ length: 45 }).map((_, i) => (
              <div
                key={`top-1-${i}`}
                className="filmstrip-sprocket-hole w-2.5 sm:w-3 h-2 sm:h-2.5 rounded-[2px] shrink-0"
              />
            ))}
          </div>
          {animated && (
            <div className="flex gap-2 sm:gap-3 shrink-0">
              {Array.from({ length: 45 }).map((_, i) => (
                <div
                  key={`top-2-${i}`}
                  className="filmstrip-sprocket-hole w-2.5 sm:w-3 h-2 sm:h-2.5 rounded-[2px] shrink-0"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {label ? (
        /* Center Marquee Ribbon with Dual Film Reels */
        <div className="filmstrip-marquee min-h-[3.25rem] sm:min-h-[3.75rem] py-2 flex items-center justify-between px-3 sm:px-6 shadow-2xl border-y transition-colors overflow-hidden">
          {/* Left Movie Reel & Extended Cinema Accent Line */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center filmstrip-reel-badge shadow-md">
              <FilmReelIcon
                size={22}
                className={`filmstrip-reel-icon ${animated ? 'animate-spin-slow' : ''}`}
              />
            </div>
            <div className="hidden md:block h-[2px] w-6 sm:w-12 lg:w-16 filmstrip-line-left rounded-full" />
          </div>

          {/* Main Queue Title */}
          <div className="flex-1 text-center px-2 min-w-0">
            <span className="filmstrip-label font-poster text-xs sm:text-base md:text-xl lg:text-2xl tracking-wider sm:tracking-widest uppercase font-extrabold block text-center leading-tight">
              {label}
            </span>
          </div>

          {/* Right Movie Reel & Extended Cinema Accent Line */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:block h-[2px] w-6 sm:w-12 lg:w-16 filmstrip-line-right rounded-full" />
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center filmstrip-reel-badge shadow-md">
              <FilmReelIcon
                size={22}
                className={`filmstrip-reel-icon ${animated ? 'animate-spin-slow' : ''}`}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="filmstrip-marquee h-3 flex items-center justify-center">
          <div className="h-[1.5px] w-full bg-[#F5B301]/40" />
        </div>
      )}

      {/* Bottom Sprocket Holes Track (Continuous Slow Train Marquee Motion if animated) */}
      <div className="filmstrip-sprocket-bar h-4 sm:h-5 w-full flex items-center overflow-hidden border-y shadow-md relative">
        <div className={`flex gap-2 sm:gap-3 shrink-0 min-w-max ${animated ? 'animate-sprocket-track' : ''}`}>
          <div className="flex gap-2 sm:gap-3 shrink-0">
            {Array.from({ length: 45 }).map((_, i) => (
              <div
                key={`bottom-1-${i}`}
                className="filmstrip-sprocket-hole w-2.5 sm:w-3 h-2 sm:h-2.5 rounded-[2px] shrink-0"
              />
            ))}
          </div>
          {animated && (
            <div className="flex gap-2 sm:gap-3 shrink-0">
              {Array.from({ length: 45 }).map((_, i) => (
                <div
                  key={`bottom-2-${i}`}
                  className="filmstrip-sprocket-hole w-2.5 sm:w-3 h-2 sm:h-2.5 rounded-[2px] shrink-0"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
