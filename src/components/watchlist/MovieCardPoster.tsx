import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Check } from 'lucide-react';
import { Movie, CONTENT_TYPE_LABELS } from '../../types/movie';
import { FilmReelIcon } from '../common/CinematicIcons';
import { CinematicPosterFallback } from '../common/CinematicPosterFallback';

interface MovieCardPosterProps {
  movie: Movie;
  index: number;
  onClick: () => void;
  onPlayTrailer?: (e: React.MouseEvent) => void;
}

export const MovieCardPoster: React.FC<MovieCardPosterProps> = ({
  movie,
  index,
  onClick,
  onPlayTrailer,
}) => {
  const [imageError, setImageError] = useState(false);
  const isUpcoming = !movie.isReleased;

  // Format release date for the ribbon
  const formatRibbonDate = (dateStr?: string) => {
    if (!dateStr) return 'SOON';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'SOON';
    }
  };

  // Extract a 4-digit release year robustly from date string or year
  const getReleaseYear = (dateStr?: string) => {
    if (!dateStr) return undefined;
    const match = dateStr.match(/\b(19|20)\d{2}\b/);
    if (match) return match[0];
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.getFullYear().toString();
    return undefined;
  };

  const releaseYear = getReleaseYear(movie.releaseDate);
  const isSeriesType = movie.contentType === 'series' || movie.contentType === 'shortseries' || movie.contentType === 'anime';
  const displayPlatform = movie.platforms && movie.platforms.length > 0 && movie.platforms[0] !== ''
    ? movie.platforms.join(', ')
    : (isSeriesType ? 'OTT / TV' : 'Theatre');

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={onClick}
      className="group relative cursor-pointer select-none flex flex-col focus:outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Poster Tile (2:3 aspect ratio) with Light Yellow Border and Bright Yellow Glow on Hover */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#12121A] border border-[#F5B301]/40 group-hover:border-[#F5B301] transition-all duration-300 transform group-hover:-translate-y-1.5 group-hover:shadow-[0_0_24px_rgba(245,179,1,0.55)] focus-within:ring-2 focus-within:ring-[#F5B301]">
        {/* Unified Top Header Bar: Content-Type & Streamable Badge (left), Watched/Upcoming/Reel (right) */}
        <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between gap-1 pointer-events-none">
          {/* Top Left: Content-Type Badge & Streamable Badge inline */}
          <div className="flex items-center gap-1 shrink-0 min-w-0 max-w-[70%]">
            <span className="content-type-badge px-1.5 py-0.5 rounded bg-[#0A0A0F]/85 backdrop-blur-md text-[#F5B301] border border-[#F5B301]/30 text-[9px] font-mono tracking-wider uppercase font-bold shadow-sm truncate">
              {CONTENT_TYPE_LABELS[movie.contentType] || movie.contentType}
            </span>

            {/* Streamable Indicator Badge inline */}
            {!isUpcoming && movie.status === 'watchlist' && (
              <div
                className="streamable-badge flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-md whitespace-nowrap shadow-md shrink-0"
                title="Released & Waiting in Watchlist"
              >
                <span className="streamable-dot w-1.5 h-1.5 rounded-full bg-[#C41E3A] animate-pulse shrink-0" />
                <span className="streamable-text text-[8.5px] font-extrabold tracking-wider uppercase font-mono">
                  Streamable
                </span>
              </div>
            )}
          </div>

          {/* Top Right: Releasing Ribbon / Watched Stamp / Film Reel Icon */}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            {isUpcoming && (
              <div className="py-0.5 px-1.5 rounded bg-gradient-to-r from-[#F5B301] to-[#F59E0B] text-[#0A0A0F] font-poster text-[9px] tracking-wider uppercase font-bold shadow-sm max-w-[110px] truncate">
                <span>RELEASING {formatRibbonDate(movie.releaseDate)}</span>
              </div>
            )}
            {movie.status === 'watched' && (
              <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#F5B301] bg-[#0A0A0F]/90 text-[#F5B301] font-poster text-[9px] tracking-wider uppercase font-bold shadow-sm -rotate-2">
                <Check size={10} className="stroke-[3]" />
                <span>WATCHED</span>
              </div>
            )}
            {!isUpcoming && movie.status !== 'watched' && (
              <div className="poster-reel-badge w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0">
                <FilmReelIcon size={18} className="animate-spin-slow" />
              </div>
            )}
          </div>
        </div>

        {/* Poster Image or Cinematic Fallback */}
        {movie.posterUrl && !imageError ? (
          <img
            src={movie.posterUrl}
            alt={`Poster image for ${movie.title}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* High-Fidelity Cinematic Poster Fallback in Movie Vibe Font */
          <CinematicPosterFallback
            title={movie.title}
            originalTitle={movie.originalTitle}
            contentType={movie.contentType}
            genres={movie.genres}
            releaseDate={movie.releaseDate}
            year={releaseYear}
            platforms={movie.platforms}
            aspect="portrait"
            hideTopHeader={true}
          />
        )}

        {/* 3. Hover Overlay: Lift + Glow + Trailer Play Button */}
        <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-3 text-center">
          <div
            onClick={(e) => {
              if (onPlayTrailer) {
                e.stopPropagation();
                onPlayTrailer(e);
              }
            }}
            className="w-12 h-12 rounded-full bg-[#F5B301] hover:bg-[#ffc629] text-[#0A0A0F] flex items-center justify-center shadow-[0_0_24px_rgba(245,179,1,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-200 cursor-pointer"
            title={movie.trailerUrl ? 'Watch Trailer' : 'View Cinema Details'}
          >
            <Play size={20} className="fill-[#0A0A0F] ml-0.5" />
          </div>
          <span className="mt-2 text-xs font-poster tracking-widest text-[#F5F5DC] uppercase">
            {movie.trailerUrl ? 'Play Trailer' : 'View Details'}
          </span>
        </div>
      </div>

      {/* Details Below Poster */}
      <div className="pt-2.5 px-0.5 space-y-1">
        {/* Title */}
        <h4 className="font-bold text-sm sm:text-base text-[#F5F5DC] group-hover:text-[#F5B301] transition-colors line-clamp-1 leading-snug">
          {movie.title}
        </h4>

        {/* Year, Content Type Badge, Platform */}
        <div className="flex items-center gap-1.5 text-xs text-[#A3A392] flex-wrap leading-tight">
          {releaseYear && (
            <span className="font-mono text-[#C4C4B5] tabular-nums shrink-0">{releaseYear}</span>
          )}
          {releaseYear && <span aria-hidden="true" className="text-[#3c3c4f] select-none">·</span>}
          <span className="text-[#F5B301] text-[11px] font-medium shrink-0">
            {CONTENT_TYPE_LABELS[movie.contentType] || movie.contentType}
          </span>
          <span aria-hidden="true" className="text-[#3c3c4f] select-none">·</span>
          <span className="text-[#737380] text-[11px] truncate max-w-[130px]" title={displayPlatform}>
            {displayPlatform}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
