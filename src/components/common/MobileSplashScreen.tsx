import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileAppIcon } from './CinematicIcons';

interface MobileSplashScreenProps {
  onFinished?: () => void;
  forceShow?: boolean;
}

export const MobileSplashScreen: React.FC<MobileSplashScreenProps> = ({
  onFinished,
  forceShow = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // If not forced and already shown in this session, we can keep it brief or show once
    const timer = setTimeout(() => {
      setIsVisible(false);
      onFinished?.();
    }, 1600);

    return () => clearTimeout(timer);
  }, [onFinished]);

  const handleDismiss = () => {
    setIsVisible(false);
    onFinished?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="mobile-app-splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[99999] bg-[#0A0A0F] flex flex-col justify-between items-center py-12 px-6 select-none cursor-pointer overflow-hidden"
          style={{ minHeight: '100dvh' }}
        >
          {/* Subtle Ambient Background Neon & Gold Radial Glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(0, 229, 255, 0.18) 0%, rgba(245, 179, 1, 0.08) 35%, transparent 70%)',
            }}
          />

          {/* Film Grain Texture Overlay */}
          <div className="film-grain" aria-hidden="true" />

          {/* Top subtle placeholder for optical balance */}
          <div className="w-full pt-4 flex justify-center opacity-60">
            <span className="text-[11px] font-mono tracking-widest text-[#737380] uppercase">
              • CINEMA COMPANION •
            </span>
          </div>

          {/* Center Stage: The Mobile App Icon */}
          <div className="relative flex flex-col items-center justify-center my-auto">
            {/* Ambient Neon Blue Backlight */}
            <div className="absolute -inset-6 rounded-3xl bg-[#00E5FF]/20 blur-2xl animate-pulse" />

            <motion.div
              initial={{ scale: 0.84, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col items-center"
            >
              {/* App Icon Container: Squircle with Light White Background, Neon Blue Reel, Yellow Play Button */}
              <div className="relative p-1 rounded-3xl bg-gradient-to-br from-white via-[#F8FAFC] to-[#E2E8F0] shadow-[0_0_35px_rgba(0,229,255,0.35),0_15px_30px_rgba(0,0,0,0.6)] border border-white/80">
                <img
                  src="/apple-touch-icon.png"
                  alt="Movielist App Icon"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-[22px] object-cover shadow-inner"
                  onError={(e) => {
                    // Fallback to SVG if image not found
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {/* Fallback inline vector in case image is loading */}
                <div className="hidden only-child:block">
                  <MobileAppIcon size={120} glow />
                </div>
              </div>

              {/* Pulsing Cinema Lens Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.35, 0.7, 0.35],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: 'easeInOut',
                }}
                className="absolute -inset-3 rounded-[32px] border border-[#00E5FF]/40 pointer-events-none"
              />
            </motion.div>
          </div>

          {/* Bottom Area: "movielist - cinematic watchlist" in Yellow Color */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="relative z-10 flex flex-col items-center text-center pb-6 sm:pb-8"
          >
            {/* The Text in Vibrant Yellow as Requested */}
            <div className="font-poster text-xl sm:text-2xl md:text-3xl tracking-[0.22em] text-[#F5B301] drop-shadow-[0_0_15px_rgba(245,179,1,0.45)] uppercase">
              movielist- cinematic watchlist
            </div>

            {/* Subtle Subtitle / Brand Flourish */}
            <div className="mt-2 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#F5B301]/60" />
              <span className="text-[10px] font-mono tracking-widest text-[#F5B301]/80 uppercase">
                Curate • Watch • Discover
              </span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#F5B301]/60" />
            </div>

            {/* Soft Loading Indicator */}
            <div className="mt-5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5B301] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            </div>

            <span className="mt-3 text-[10px] text-[#737380] font-sans tracking-wide">
              Tap anywhere to continue
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
