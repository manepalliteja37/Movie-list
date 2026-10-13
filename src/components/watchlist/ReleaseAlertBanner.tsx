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

          const alertConfig = (() => {
            switch (alert.type) {
              case '7day':
                return {
                  emoji: '🎟️',
                  badge: '7 Days Left · Plan Ahead',
                  badgeColor: 'bg-[#F5B301]/20 text-[#F5B301] border-[#F5B301]/40',
                  headline: alert.headline || `DID YOU PLAN TO WATCH ${alert.title.toUpperCase()}?`,
                  message: alert.message || 'Premieres in 7 days! Gather your film gang or clear your calendar.',
                  btnLabel: 'Plan to Watch',
                };
              case '3day':
                return {
                  emoji: '🍿',
                  badge: '3 Days Left · Tickets Live',
                  badgeColor: 'bg-[#C41E3A]/25 text-[#FF5A6E] border-[#C41E3A]/50',
                  headline: alert.headline || `DID YOU BUY A TICKET FOR ${alert.title.toUpperCase()}?`,
                  message: alert.message || 'Advance bookings are open! Grab your favourite seats before housefull signs go up.',
                  btnLabel: 'Check Tickets',
                };
              case 'ott_reminder':
                return {
                  emoji: '📺',
                  badge: 'Watchlist Queue Check-In',
                  badgeColor: 'bg-[#0284C7]/20 text-[#38BDF8] border-[#0284C7]/40',
                  headline: alert.headline || `DID YOU WATCH ${alert.title.toUpperCase()} YET?`,
                  message: alert.message || `You added this film to your watchlist. Available now on ${alert.platform} — watch tonight!`,
                  btnLabel: 'Watch Tonight',
                };
              case 'ott_review':
                return {
                  emoji: '⭐',
                  badge: 'Cinephile Review Check-In',
                  badgeColor: 'bg-[#7C3AED]/20 text-[#C084FC] border-[#7C3AED]/40',
                  headline: alert.headline || `WATCHED ${alert.title.toUpperCase()}? HOW WAS IT?`,
                  message: alert.message || 'Did it meet the hype? Rate it out of 10 and log your review on Movielist!',
                  btnLabel: 'Rate & Review',
                };
              case 'ott_recommend':
                return {
                  emoji: '🎁',
                  badge: 'Recommend To A Friend',
                  badgeColor: 'bg-[#E11D48]/20 text-[#FB7185] border-[#E11D48]/40',
                  headline: alert.headline || `DID YOU RECOMMEND ${alert.title.toUpperCase()} TO A FRIEND?`,
                  message: alert.message || 'Loved the movie? Share your custom collectible ticket pass with friends!',
                  btnLabel: 'Share Ticket Pass',
                };
              case 'release':
              default:
                return {
                  emoji: '🎬',
                  badge: `Now Showing · ${alert.platform}`,
                  badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
                  headline: alert.headline || `GO WATCH ${alert.title.toUpperCase()} IN NEARBY THEATRES!`,
                  message: alert.message || 'First Day First Show energy! Big screen spectacle awaits — grab your popcorn and go watch!',
                  btnLabel: 'Showtime Info',
                };
            }
          })();

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#1E1805] via-[#14141C] to-[#1A1215] border-2 border-[#F5B301]/70 shadow-[0_8px_24px_rgba(245,179,1,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F5B301] text-[#0A0A0F] flex items-center justify-center shrink-0 text-xl font-bold shadow-md">
                  {alertConfig.emoji}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-poster text-sm sm:text-base md:text-lg text-[#F5F5DC] tracking-wide leading-none truncate">
                      {alertConfig.headline}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${alertConfig.badgeColor}`}>
                      {alertConfig.badge}
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-[#C4C4B5] mt-1 font-sans">
                    {alertConfig.message}
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
                    {alertConfig.btnLabel}
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
