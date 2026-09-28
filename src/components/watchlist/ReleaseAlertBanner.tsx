import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bell, X, Film, CheckCircle2 } from 'lucide-react';
import { useMovieStore } from '../../store/useMovieStore';
import { Movie } from '../../types/movie';

interface ReleaseAlertBannerProps {
  onSelectMovie?: (movie: Movie) => void;
}

export const ReleaseAlertBanner: React.FC<ReleaseAlertBannerProps> = ({ onSelectMovie }) => {
  const { releaseAlerts, dismissReleaseAlert, dismissAllReleaseAlerts, movies } = useMovieStore();

  if (releaseAlerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <AnimatePresence>
        {releaseAlerts.map((alert) => {
          const matchedMovie = movies.find((m) => m.id === alert.movieId);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="relative overflow-hidden p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#1E1805] via-[#14141C] to-[#1A1215] border-2 border-[#F5B301]/70 shadow-[0_8px_24px_rgba(245,179,1,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F5B301] text-[#0A0A0F] flex items-center justify-center shrink-0 font-bold shadow-md">
                  🎉
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-poster text-sm sm:text-base md:text-lg text-[#F5F5DC] tracking-wide leading-none truncate">
                      {alert.title} HAS RELEASED!
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F5B301]/20 text-[#F5B301] border border-[#F5B301]/40 uppercase">
                      Now Streaming on {alert.platform}
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-[#C4C4B5] mt-0.5">
                    Now available! Add it to your weekend binge queue?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {matchedMovie && onSelectMovie && (
                  <button
                    type="button"
                    onClick={() => onSelectMovie(matchedMovie)}
                    className="px-3 py-1.5 rounded-xl bg-[#F5B301] hover:bg-[#ffc629] text-[#0A0A0F] font-poster text-xs tracking-wider uppercase font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    View Details
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => dismissReleaseAlert(alert.id)}
                  className="p-1.5 rounded-lg text-[#737380] hover:text-[#F5F5DC] hover:bg-white/10 transition-colors cursor-pointer"
                  title="Dismiss alert"
                  aria-label="Dismiss alert"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
