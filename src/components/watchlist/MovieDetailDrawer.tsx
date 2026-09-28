import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Calendar,
  Sparkles,
  ExternalLink,
  Trash2,
  Tv,
  Star,
  Film,
  Check,
  Share2,
  Clock,
  Youtube,
  Bell,
  MessageSquare,
  Edit3,
  Layers,
  MonitorPlay,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Movie, CONTENT_TYPE_LABELS } from '../../types/movie';
import { useMovieStore } from '../../store/useMovieStore';
import { StampButton } from '../common/StampButton';
import { TicketButton } from '../common/TicketButton';
import { FilmReelIcon, TicketIcon } from '../common/CinematicIcons';
import { MarkAsWatchedModal } from './MarkAsWatchedModal';
import { ShareMovieModal } from './ShareMovieModal';
import { CinematicPosterFallback } from '../common/CinematicPosterFallback';

interface MovieDetailDrawerProps {
  movie: Movie | null;
  onClose: () => void;
  onEdit?: (movie: Movie) => void;
  onShowToast?: (message: string) => void;
}

// Platform badge styling helper
const getPlatformBadgeStyle = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('netflix')) return 'bg-[#E50914]/15 border-[#E50914]/50 text-[#FF5A6E]';
  if (p.includes('prime')) return 'bg-[#00A8E1]/15 border-[#00A8E1]/50 text-[#38BDF8]';
  if (p.includes('hotstar') || p.includes('disney')) return 'bg-[#113CCF]/20 border-[#3B82F6]/50 text-[#60A5FA]';
  if (p.includes('aha')) return 'bg-[#FF6E14]/15 border-[#FF6E14]/50 text-[#FB923C]';
  if (p.includes('zee')) return 'bg-[#8230C6]/20 border-[#A855F7]/50 text-[#C084FC]';
  if (p.includes('youtube')) return 'bg-[#FF0000]/15 border-[#FF0000]/50 text-[#F87171]';
  if (p.includes('theatre')) return 'bg-[#F5B301]/15 border-[#F5B301]/50 text-[#F5B301]';
  return 'bg-[#181824] border-[#2c2c40] text-[#E0E0CE]';
};

export const MovieDetailDrawer: React.FC<MovieDetailDrawerProps> = ({
  movie,
  onClose,
  onEdit,
  onShowToast,
}) => {
  const { updateMovie, deleteMovie, moveToWatchlist, markAsWatched } = useMovieStore();

  const [isMarkWatchedOpen, setIsMarkWatchedOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  if (!movie) return null;

  const isWatched = movie.status === 'watched';
  const isUpcoming = !movie.isReleased;

  // Release countdown calculation
  const getReleaseCountdown = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const release = new Date(dateStr);
    release.setHours(0, 0, 0, 0);

    const diffTime = release.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;
    if (diffDays === 0) return 'Releasing today! 🎉';
    if (diffDays === 1) return 'Releasing tomorrow! 🎬';
    return `Releasing in ${diffDays} days`;
  };

  const countdownText = getReleaseCountdown(movie.releaseDate);

  // Formatted release date
  const formatFullReleaseDate = (dateStr?: string) => {
    if (!dateStr) return 'Release Date Unannounced';
    try {
      const d = new Date(dateStr);
      const formatted = d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return isUpcoming ? `Releasing on ${formatted}` : `Released on ${formatted}`;
    } catch {
      return dateStr;
    }
  };

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : undefined;

  // Toggle notification reminder
  const handleToggleNotify = async () => {
    const updatedVal = !movie.notifyOnRelease;
    await updateMovie(movie.id, { notifyOnRelease: updatedVal });
    onShowToast?.(
      updatedVal
        ? 'Reminder set for release day 🔔'
        : 'Release notification disabled'
    );
  };

  // Mark as watched confirmation handler
  const handleConfirmWatched = async (data: {
    rating: number;
    watchedDate: string;
    watchedPlatform?: string;
    notes?: string;
    shareCaption?: string;
  }) => {
    await markAsWatched(movie.id, data);
    setIsMarkWatchedOpen(false);
    onShowToast?.('Marked as watched! 🎟️');

    // Follow-up question: share with friend?
    setTimeout(() => {
      setIsShareModalOpen(true);
    }, 400);
  };

  const handleDeleteConfirmed = async () => {
    await deleteMovie(movie.id);
    setIsDeleteConfirmOpen(false);
    onShowToast?.(`Removed "${movie.title}"`);
    onClose();
  };

  const handleWatchTrailer = () => {
    if (movie.trailerUrl) {
      window.open(movie.trailerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
        {/* Click outside backdrop to close */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Drawer Container: Slide from right on desktop, slide up from bottom on mobile */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-xl bg-[#14141C] border-l border-[#28283C] shadow-2xl flex flex-col h-full z-10 overflow-y-auto"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#101018]/95 backdrop-blur-md border-b border-[#20202E]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
                <FilmReelIcon size={16} />
              </div>
              <span className="font-poster text-lg tracking-wider text-[#F5F5DC]">
                CINEMA TICKET DETAIL
              </span>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-lg bg-[#1C1C28] hover:bg-[#28283C] text-[#A3A392] hover:text-[#F5F5DC] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 1. Hero Section: Poster, Large Title in Bebas Neue, Original Title & Row of Pills */}
          <div className="relative">
            {/* Poster / Backdrop Hero */}
            <div className="relative aspect-[16/9] w-full bg-[#0A0A0F] border-b border-[#20202E] overflow-hidden flex items-center justify-center">
              {movie.posterUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14141C] via-[#14141C]/40 to-transparent" />
                </div>
              ) : (
                <CinematicPosterFallback
                  title={movie.title}
                  originalTitle={movie.originalTitle}
                  contentType={movie.contentType}
                  genres={movie.genres}
                  releaseDate={movie.releaseDate}
                  platforms={movie.platforms}
                  aspect="banner"
                  showBillingBlock={false}
                />
              )}

              {/* Status Badges on Hero */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                {isWatched ? (
                  <span className="stamp-watched text-xs">WATCHED</span>
                ) : isUpcoming ? (
                  <span className="py-1 px-3 rounded-lg bg-gradient-to-r from-[#F5B301] to-[#D97706] text-[#0A0A0F] font-poster text-xs tracking-wider uppercase font-bold shadow-lg">
                    UPCOMING
                  </span>
                ) : (
                  <span className="py-1 px-2.5 rounded-lg bg-[#0A0A0F]/85 border border-[#C41E3A]/40 text-[#F5F5DC] text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-[#C41E3A] animate-pulse" />
                    <span>In Watchlist</span>
                  </span>
                )}
              </div>
            </div>

            {/* Title Lockup & Row of Pills */}
            <div className="p-6 pb-4 border-b border-[#20202E] space-y-3">
              <div>
                <h1 className="font-poster text-3xl sm:text-4xl text-[#F5F5DC] tracking-wide leading-tight drop-shadow-sm">
                  {movie.title}
                </h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <h2 className="text-sm text-[#A3A392] font-telugu italic mt-1">
                    {movie.originalTitle}
                  </h2>
                )}
              </div>

              {/* Row of Pills: Content type, Release year, Languages, Rating badge */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-[#181824] border border-[#2c2c40] text-[#F5B301] font-semibold">
                  {CONTENT_TYPE_LABELS[movie.contentType]}
                </span>

                {releaseYear && (
                  <span className="px-3 py-1 rounded-full bg-[#181824] border border-[#2c2c40] text-[#C4C4B5] font-mono">
                    {releaseYear}
                  </span>
                )}

                {movie.languages.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-[#181824] border border-[#2c2c40] text-[#A3A392]">
                    {movie.languages.slice(0, 2).join(' · ')}
                  </span>
                )}

                {movie.rating ? (
                  <span className="px-3 py-1 rounded-full bg-[#F5B301]/15 border border-[#F5B301]/40 text-[#F5B301] font-mono font-bold flex items-center gap-1">
                    <Star size={12} className="fill-[#F5B301]" />
                    <span>{movie.rating} / 10</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[#181824] border border-[#2c2c40] text-[#737380] text-[11px]">
                    Unrated
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Action Buttons Row (Ticket-stub styled) */}
          <div className="p-4 bg-[#101018] border-b border-[#20202E]">
            {isWatched ? (
              /* Watched State Buttons: Share (primary), Move back to Watchlist, Edit rating, Edit, Delete */
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {/* 1. Share (Primary Action) */}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="ticket-notch-button py-2 px-2.5 text-xs font-poster uppercase tracking-wider bg-[#F5B301] text-[#0A0A0F] hover:bg-[#ffc629] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_10px_rgba(245,179,1,0.3)]"
                  title="Share Ticket Pass & Review"
                >
                  <Share2 size={13} className="shrink-0" />
                  <span className="truncate">Share</span>
                </button>

                {/* 2. Move back to Watchlist (re-watch later) */}
                <button
                  type="button"
                  onClick={async () => {
                    await moveToWatchlist(movie.id);
                    onShowToast?.(`Moved "${movie.title}" back to Watchlist 🎬`);
                  }}
                  className="ticket-notch-button py-2 px-2.5 text-xs font-poster uppercase tracking-wider bg-[#1C1C28] text-[#F5F5DC] hover:text-[#F5B301] hover:bg-[#252536] border border-[#28283C] flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Move back to Watchlist (Re-watch later)"
                >
                  <RotateCcw size={12} className="shrink-0" />
                  <span className="truncate">Watchlist</span>
                </button>

                {/* 3. Edit Rating */}
                <button
                  type="button"
                  onClick={() => setIsMarkWatchedOpen(true)}
                  className="ticket-notch-button py-2 px-2.5 text-xs font-poster uppercase tracking-wider bg-[#1C1C28] text-[#F5B301] hover:bg-[#252536] border border-[#28283C] flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Edit Rating & Review Notes"
                >
                  <Star size={12} className="fill-[#F5B301] shrink-0" />
                  <span className="truncate">Edit Rating</span>
                </button>

                {/* 4. Edit details */}
                <button
                  type="button"
                  onClick={() => {
                    onEdit?.(movie);
                    onClose();
                  }}
                  className="ticket-notch-button py-2 px-2.5 text-xs font-poster uppercase tracking-wider bg-[#1C1C28] text-[#A3A392] hover:text-[#F5F5DC] hover:bg-[#252536] border border-[#28283C] flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Edit All Details"
                >
                  <Edit3 size={12} className="shrink-0" />
                  <span className="truncate">Edit</span>
                </button>

                {/* 5. Delete */}
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="col-span-2 sm:col-span-1 ticket-notch-button py-2 px-2.5 text-xs font-poster uppercase tracking-wider bg-[#1C1C28] text-[#737380] hover:text-[#FF6B6B] hover:bg-[#C41E3A]/20 border border-[#28283C] flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Delete Cinema Entry"
                >
                  <Trash2 size={12} className="shrink-0" />
                  <span className="truncate">Delete</span>
                </button>
              </div>
            ) : (
              /* Watchlist State Buttons */
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {/* Mark as Watched - full width on mobile as primary action */}
                <button
                  type="button"
                  onClick={() => setIsMarkWatchedOpen(true)}
                  className="col-span-2 sm:col-span-1 ticket-notch-button py-2.5 sm:py-2 px-2.5 text-xs font-poster uppercase tracking-wider bg-[#C41E3A] hover:bg-[#d62443] text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md min-h-[40px]"
                  title="Mark as Watched"
                >
                  <Check size={13} className="stroke-[3] shrink-0" />
                  <span className="truncate">Mark Watched</span>
                </button>

                {/* Watch Trailer */}
                <button
                  type="button"
                  disabled={!movie.trailerUrl}
                  onClick={handleWatchTrailer}
                  className={`ticket-notch-button py-2 px-2.5 text-xs font-poster uppercase tracking-wider flex items-center justify-center gap-1.5 min-h-[40px] ${
                    movie.trailerUrl
                      ? 'bg-[#1C1C28] text-[#F5B301] hover:bg-[#252536] border border-[#28283C] cursor-pointer'
                      : 'bg-[#101018] text-[#555566] border border-[#1C1C28] cursor-not-allowed opacity-60'
                  }`}
                  title={movie.trailerUrl ? 'Open Trailer in New Tab' : 'No trailer link added'}
                >
                  <Play size={12} className="fill-current shrink-0" />
                  <span className="truncate">Trailer</span>
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => {
                    onEdit?.(movie);
                    onClose();
                  }}
                  className="ticket-notch-button py-2 px-2.5 text-xs font-poster uppercase tracking-wider bg-[#1C1C28] text-[#F5F5DC] hover:text-[#F5B301] hover:bg-[#252536] border border-[#28283C] flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                  title="Edit Movie Details"
                >
                  <Edit3 size={12} className="shrink-0" />
                  <span className="truncate">Edit</span>
                </button>

                {/* Share */}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="ticket-notch-button py-2 px-2.5 text-xs font-poster uppercase tracking-wider bg-[#1C1C28] text-[#F5B301] hover:bg-[#252536] border border-[#28283C] flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                  title="Share Ticket Pass"
                >
                  <Share2 size={12} className="shrink-0" />
                  <span className="truncate">Share</span>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="ticket-notch-button py-2 px-2.5 text-xs font-poster uppercase tracking-wider bg-[#1C1C28] text-[#737380] hover:text-[#FF6B6B] hover:bg-[#C41E3A]/20 border border-[#28283C] flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                  title="Delete Cinema Entry"
                >
                  <Trash2 size={12} className="shrink-0" />
                  <span className="truncate">Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Upcoming Banner & Prompt Section */}
          {isUpcoming && (
            <div className="p-5 bg-gradient-to-r from-[#1C1810] to-[#14141C] border-b border-[#F5B301]/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F5B301]/20 border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301] shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-poster text-lg text-[#F5B301] tracking-wide truncate">
                      {countdownText || 'UPCOMING PREMIERE'}
                    </div>
                    <div className="text-xs text-[#A3A392] truncate">
                      {formatFullReleaseDate(movie.releaseDate)}
                    </div>
                  </div>
                </div>

                {/* Toggle: Notify me on release day */}
                <label className="flex items-center gap-2 text-xs font-medium text-[#F5F5DC] cursor-pointer select-none bg-[#0A0A0F] border border-[#F5B301]/40 px-3 py-1.5 rounded-xl hover:border-[#F5B301] transition-colors shrink-0 self-start sm:self-auto">
                  <Bell size={13} className="text-[#F5B301]" />
                  <span>Notify on Release</span>
                  <input
                    type="checkbox"
                    checked={movie.notifyOnRelease ?? true}
                    onChange={handleToggleNotify}
                    className="sr-only"
                  />
                  <div
                    className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0 ml-1 toggle-track ${
                      (movie.notifyOnRelease ?? true) ? 'bg-[#F5B301]' : 'bg-[#1E1E2A]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${
                        (movie.notifyOnRelease ?? true) ? 'translate-x-[20px]' : 'translate-x-0'
                      }`}
                    >
                      {(movie.notifyOnRelease ?? true) ? (
                        <ChevronLeft size={13} className="text-[#1A1A24] stroke-[2.5]" />
                      ) : (
                        <ChevronRight size={13} className="text-[#1A1A24] stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Prompt if already released and user hasn't marked watched */}
          {!isUpcoming && !isWatched && (
            <div className="p-4 bg-[#1C1C28]/60 border-b border-[#20202E] flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-semibold text-[#F5F5DC] block">
                  Now available to stream!
                </span>
                <span className="text-[#A3A392]">
                  Did you finish watching this movie?
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMarkWatchedOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#C41E3A] hover:bg-[#d62443] text-white text-xs font-poster tracking-wider uppercase font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
              >
                <Check size={13} className="stroke-[3]" />
                <span>Mark Watched</span>
              </button>
            </div>
          )}

          {/* 3. Info Grid: Genres, Platforms, Release date, Recommended by, Notes */}
          <div className="p-6 space-y-6 flex-1">
            {/* Platforms */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5B301] mb-2 flex items-center gap-1.5">
                <MonitorPlay size={13} />
                <span>Where to Watch</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {movie.platforms.map((platform) => (
                  <span
                    key={platform}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 shadow-sm ${getPlatformBadgeStyle(
                      platform
                    )}`}
                  >
                    <Film size={12} className="opacity-80" />
                    <span>{platform}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-2 flex items-center gap-1.5">
                <Layers size={13} className="text-[#F5B301]" />
                <span>Genres</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2.5 py-1 rounded-lg bg-[#0A0A0F] border border-[#28283C] text-xs text-[#E0E0CE]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Synopsis with "Read more" expand if long */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-2">
                Synopsis & Plot Premise
              </h3>
              <div className="p-4 bg-[#0A0A0F] border border-[#262638] rounded-2xl relative">
                <p
                  className={`text-xs sm:text-sm text-[#C4C4B5] leading-relaxed whitespace-pre-line transition-all ${
                    !isSynopsisExpanded && movie.synopsis.length > 200
                      ? 'line-clamp-3'
                      : ''
                  }`}
                >
                  {movie.synopsis || 'No synopsis added yet for this film.'}
                </p>

                {movie.synopsis.length > 200 && (
                  <button
                    type="button"
                    onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                    className="mt-2 text-xs font-medium text-[#F5B301] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isSynopsisExpanded ? 'Show less' : 'Read more'}</span>
                    {isSynopsisExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}
              </div>
            </div>

            {/* Release Date Info */}
            <div className="p-3.5 rounded-xl bg-[#0A0A0F] border border-[#20202E] flex items-center justify-between text-xs">
              <span className="text-[#737380] uppercase tracking-wider font-semibold">
                Release Timeline
              </span>
              <span className="text-[#F5F5DC] font-medium">
                {formatFullReleaseDate(movie.releaseDate)}
              </span>
            </div>

            {/* Recommended By */}
            {movie.recommendedBy && (
              <div className="p-3.5 rounded-xl bg-[#0A0A0F] border border-[#20202E] space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#F5B301] flex items-center gap-1.5">
                  <Youtube size={14} className="text-[#FF4444]" />
                  <span>Recommendation Credit</span>
                </div>
                <p className="text-xs text-[#E0E0CE] italic">
                  "{movie.recommendedBy}"
                </p>
              </div>
            )}

            {/* Personal Notes */}
            {movie.notes && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A3A392] flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-[#F5B301]" />
                  <span>Personal Notes & Reminders</span>
                </h3>
                <div className="p-3.5 bg-[#0A0A0F] border border-[#20202E] rounded-xl text-xs text-[#C4C4B5] leading-relaxed">
                  {movie.notes}
                </div>
              </div>
            )}

            {/* If Watched Details (Watched Date & Watched Platform) */}
            {isWatched && (
              <div className="p-4 bg-[#1C1418] border border-[#C41E3A]/40 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#FF7588] font-semibold">Logged as Watched</span>
                  {movie.watchedDate && (
                    <span className="text-[#C4C4B5] font-mono">
                      {new Date(movie.watchedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {movie.watchedPlatform && (
                  <div className="text-xs text-[#A3A392]">
                    Watched on: <strong className="text-[#F5F5DC]">{movie.watchedPlatform}</strong>
                  </div>
                )}
                {movie.shareCaption && (
                  <div className="text-xs text-[#E0E0CE] italic border-t border-[#C41E3A]/20 pt-2 mt-2">
                    Review: "{movie.shareCaption}"
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mark As Watched Flow Modal */}
      <MarkAsWatchedModal
        movie={movie}
        isOpen={isMarkWatchedOpen}
        onClose={() => setIsMarkWatchedOpen(false)}
        onConfirm={handleConfirmWatched}
      />

      {/* Share Movie Modal */}
      <ShareMovieModal
        movie={movie}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-[#14141C] border border-[#C41E3A]/60 rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-[#C41E3A]/20 border border-[#C41E3A] flex items-center justify-center text-[#FF5A6E] mx-auto">
              <AlertTriangle size={24} />
            </div>

            <h3 className="font-poster text-xl text-[#F5F5DC] tracking-wider">
              REMOVE FROM MOVIELIST?
            </h3>

            <p className="text-xs text-[#A3A392] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#F5F5DC]">"{movie.title}"</strong>?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1C1C28] text-xs font-medium text-[#A3A392] hover:text-[#F5F5DC]"
              >
                Keep Movie
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded-xl bg-[#C41E3A] hover:bg-[#d62443] text-xs font-poster tracking-wider uppercase font-bold text-white shadow-lg cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
