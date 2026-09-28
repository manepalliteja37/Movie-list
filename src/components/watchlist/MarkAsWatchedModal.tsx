import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Check, Calendar, MonitorPlay, MessageSquare } from 'lucide-react';
import { Movie, COMMON_PLATFORMS } from '../../types/movie';
import { StampButton } from '../common/StampButton';
import { FilmReelIcon } from '../common/CinematicIcons';

interface MarkAsWatchedModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    rating: number;
    watchedDate: string;
    watchedPlatform?: string;
    notes?: string;
    shareCaption?: string;
  }) => void;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Unbearable',
  2: 'Terrible',
  3: 'Poor',
  4: 'Subpar',
  5: 'Average',
  6: 'Decent',
  7: 'Good',
  8: 'Great',
  9: 'Brilliant',
  10: 'Masterpiece 🏆',
};

export const MarkAsWatchedModal: React.FC<MarkAsWatchedModalProps> = ({
  movie,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [rating, setRating] = useState<number>(movie?.rating || 8);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [watchedDate, setWatchedDate] = useState<string>(
    movie?.watchedDate || new Date().toISOString().split('T')[0]
  );
  const [watchedPlatform, setWatchedPlatform] = useState<string>(
    movie?.watchedPlatform || movie?.platforms[0] || 'Theatre'
  );
  const [shareCaption, setShareCaption] = useState<string>(
    movie?.shareCaption || movie?.notes || ''
  );

  if (!isOpen || !movie) return null;

  const currentRatingDisplay = hoveredRating !== null ? hoveredRating : rating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      rating,
      watchedDate,
      watchedPlatform,
      notes: shareCaption || movie.notes,
      shareCaption,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-[#14141C] border border-[#28283C] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Top Bar with Crimson Watched Ribbon */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#101018] border-b border-[#20202E]">
            <div className="flex items-center gap-2.5">
              <span className="stamp-watched text-xs py-0.5 px-2">WATCHED</span>
              <h3 className="font-poster text-lg tracking-wider text-[#F5F5DC]">
                STAMP AS WATCHED
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#737380] hover:text-[#F5F5DC] p-1.5 rounded-lg hover:bg-[#1C1C28] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Film Title Preview */}
            <div className="p-3 bg-[#0A0A0F] border border-[#262638] rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1C1C28] border border-[#28283C] flex items-center justify-center text-[#F5B301] shrink-0 font-poster text-lg">
                {movie.title.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-[#F5F5DC] truncate">
                  {movie.title}
                </div>
                <div className="text-[11px] text-[#A3A392] truncate">
                  {movie.genres.slice(0, 3).join(', ')}
                </div>
              </div>
            </div>

            {/* 1. Rating Selector: 1-10 stars animated */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#F5B301]">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#F5B301] tabular-nums">
                    {currentRatingDisplay} / 10
                  </span>
                  <span className="text-xs text-[#A3A392] font-medium">
                    ({RATING_DESCRIPTIONS[currentRatingDisplay]})
                  </span>
                </div>
              </div>

              {/* 10-star bar */}
              <div className="flex items-center justify-between p-2.5 bg-[#0A0A0F] rounded-xl border border-[#262638]">
                {Array.from({ length: 10 }).map((_, index) => {
                  const starVal = index + 1;
                  const isFilled = starVal <= currentRatingDisplay;

                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoveredRating(starVal)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={20}
                        className={`transition-colors ${
                          isFilled
                            ? 'text-[#F5B301] fill-[#F5B301] drop-shadow-[0_0_6px_rgba(245,179,1,0.5)]'
                            : 'text-[#38384d] hover:text-[#F5B301]/50'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. "Watched on" date (default today) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#F5B301]" />
                <span>Watched Date</span>
              </label>
              <div className="relative flex items-center">
                <Calendar
                  size={16}
                  className="absolute left-3 text-[#F5B301] pointer-events-none drop-shadow-[0_0_6px_rgba(245,179,1,0.4)]"
                />
                <input
                  type="date"
                  required
                  value={watchedDate}
                  onChange={(e) => setWatchedDate(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-sm text-[#F5F5DC] focus:border-[#F5B301] focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Optional: "Where did you watch it?" */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-1.5 flex items-center gap-1.5">
                <MonitorPlay size={13} className="text-[#F5B301]" />
                <span>Where did you watch it? (Optional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PLATFORMS.map((plat) => {
                  const active = watchedPlatform === plat;
                  return (
                    <button
                      type="button"
                      key={plat}
                      onClick={() => setWatchedPlatform(plat)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#181824] border-[#F5B301] text-[#F5B301] font-semibold'
                          : 'bg-[#0A0A0F] border-[#262638] text-[#737380] hover:text-[#A3A392]'
                      }`}
                    >
                      {plat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Optional: "Add a note for friends" (becomes share caption) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-[#F5B301]" />
                  <span>Note for friends / Quick Review</span>
                </span>
                <span className="text-[10px] text-[#737380]">Becomes share caption</span>
              </label>
              <textarea
                rows={2}
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                placeholder="e.g. Must watch in Atmos! The interval scene was legendary..."
                className="w-full p-2.5 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-xs text-[#F5F5DC] placeholder-[#555566] focus:border-[#F5B301] focus:outline-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[#20202E] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#A3A392] hover:text-[#F5F5DC] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="stamp-btn py-2 px-5 text-sm font-poster uppercase font-bold tracking-wider inline-flex items-center gap-2 cursor-pointer"
              >
                <Check size={16} className="stroke-[3]" />
                <span>Confirm & Stamp Watched</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
