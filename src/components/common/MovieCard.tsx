import React, { useState } from 'react';
import {
  ExternalLink,
  Trash2,
  Star,
  Info,
} from 'lucide-react';
import { Movie, CONTENT_TYPE_LABELS } from '../../types/movie';
import { useMovieStore } from '../../store/useMovieStore';
import { StampButton } from './StampButton';
import { FilmReelIcon } from './CinematicIcons';
import { CinematicPosterFallback } from './CinematicPosterFallback';

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect }) => {
  const { markAsWatched, moveToWatchlist, deleteMovie, setRating } = useMovieStore();
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [ratingHover, setRatingHover] = useState<number | null>(null);

  const isWatched = movie.status === 'watched';

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWatched) {
      moveToWatchlist(movie.id);
    } else {
      markAsWatched(movie.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove "${movie.title}" from your list?`)) {
      deleteMovie(movie.id);
    }
  };

  return (
    <div
      onClick={() => onSelect?.(movie)}
      className="group relative bg-[#14141C] border border-[#F5B301]/35 hover:border-[#F5B301] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_24px_rgba(245,179,1,0.5)] focus:ring-2 focus:ring-[#F5B301] flex flex-col cursor-pointer"
    >
      {/* Top Banner / Poster Frame */}
      <div className="relative h-44 sm:h-48 w-full bg-[#101018] overflow-hidden flex items-center justify-center border-b border-[#20202E]">
        {movie.posterUrl && !imageError ? (
          <img
            src={movie.posterUrl}
            alt={`Poster image for ${movie.title}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* High-Fidelity Stylized Cinematic Poster Fallback */
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

        {/* Floating Status Stamp if Watched */}
        {isWatched && (
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <span className="stamp-watched text-xs">WATCHED</span>
          </div>
        )}

        {/* Floating Status if Upcoming */}
        {!isWatched && !movie.isReleased && (
          <div className="absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F5B301]/20 border border-[#F5B301]/50 text-[#F5B301] text-[10px] font-mono uppercase tracking-wider backdrop-blur-sm">
            <span>UPCOMING</span>
            {movie.notifyOnRelease && <span title="Reminder enabled">🔔</span>}
          </div>
        )}

        {/* Quick action buttons floating on poster */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            title="Delete from list"
            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm text-[#A3A392] hover:text-[#FF6B6B] flex items-center justify-center border border-white/10"
          >
            <Trash2 size={13} />
          </button>
          {movie.trailerUrl && (
            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Watch Trailer"
              className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm text-[#FF4444] hover:text-white flex items-center justify-center border border-white/10"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Zero-Pill unboxed clean text separated by dots */}
          {(() => {
            const getReleaseYear = (dateStr?: string) => {
              if (!dateStr) return undefined;
              const match = dateStr.match(/\b(19|20)\d{2}\b/);
              if (match) return match[0];
              const d = new Date(dateStr);
              if (!isNaN(d.getTime())) return d.getFullYear().toString();
              return undefined;
            };
            const yearStr = getReleaseYear(movie.releaseDate);
            const isSeriesType = movie.contentType === 'series' || movie.contentType === 'shortseries' || movie.contentType === 'anime';
            const platformStr = movie.platforms && movie.platforms.length > 0 && movie.platforms[0] !== ''
              ? movie.platforms.join(', ')
              : (isSeriesType ? 'OTT / TV' : 'Theatre');

            return (
              <>
                <div className="flex items-center gap-2 text-xs text-[#A3A392] mb-1.5 flex-wrap">
                  <span className="text-[#F5B301] font-medium">
                    {CONTENT_TYPE_LABELS[movie.contentType] || movie.contentType}
                  </span>
                  <span aria-hidden="true" className="text-[#3c3c4f]">·</span>
                  <span>{movie.genres.slice(0, 2).join(', ')}</span>
                  {yearStr && (
                    <>
                      <span aria-hidden="true" className="text-[#3c3c4f]">·</span>
                      <span className="font-mono text-[#C4C4B5]">{yearStr}</span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-poster text-xl tracking-wide text-[#F5F5DC] group-hover:text-[#F5B301] transition-colors line-clamp-1">
                  {movie.title}
                </h3>

                {/* Original Title (Telugu/Regional) */}
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="text-xs text-[#A3A392] font-telugu mt-0.5 line-clamp-1">
                    {movie.originalTitle}
                  </p>
                )}

                {/* Synopsis preview */}
                <p className="text-xs text-[#8E8E9E] mt-2 line-clamp-2 leading-relaxed">
                  {movie.synopsis}
                </p>

                {/* Recommendation Source Banner if provided */}
                {movie.recommendedBy && (
                  <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-[#0E0E14] border border-[#20202E] text-[11px] text-[#A3A392] flex items-center gap-1.5">
                    <span className="text-[#F5B301] font-medium">Source:</span>
                    <span className="truncate text-[#E0E0CE]">{movie.recommendedBy}</span>
                  </div>
                )}

                {/* Platform tags */}
                <div className="mt-2.5 flex items-center gap-2 text-xs text-[#737380] flex-wrap">
                  <span className="text-[11px] font-semibold text-[#5c5c70] uppercase">Available on:</span>
                  <span className="text-[#C4C4B5] truncate">
                    {platformStr}
                  </span>
                </div>
              </>
            );
          })()}
        </div>

        {/* Card Footer with Stamp Action and Rating */}
        <div className="pt-4 mt-3 border-t border-[#20202E] flex items-center justify-between gap-2">
          {/* Status Button: Red Stamp for Watched / Watchlist */}
          <StampButton
            size="sm"
            onClick={handleToggleStatus}
            isWatched={isWatched}
          >
            Mark Watched
          </StampButton>

          {/* If Watched: User Rating Stars (1-10) */}
          {isWatched ? (
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-[#F5B301] text-[#F5B301]" />
              <span className="text-xs font-mono font-semibold text-[#F5F5DC] tabular-nums">
                {movie.rating ? `${movie.rating}/10` : 'Rated'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] text-[#737380] hover:text-[#F5F5DC] flex items-center gap-1 transition-colors"
            >
              <Info size={13} />
              <span>Details</span>
            </button>
          )}
        </div>

        {/* Collapsible Details Drawer */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-[#1C1C28] text-xs text-[#A3A392] space-y-1.5 animate-fadeIn">
            {movie.notes && (
              <div>
                <span className="text-[#F5B301] font-medium">Notes: </span>
                <span className="text-[#E0E0CE]">{movie.notes}</span>
              </div>
            )}
            <div>
              <span className="text-[#737380]">Audio/Subs: </span>
              <span>{movie.languages.join(', ')}</span>
            </div>
            {movie.addedAt && (
              <div className="text-[10px] text-[#555566]">
                Saved on {new Date(movie.addedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
