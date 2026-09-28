import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilmReelIcon } from '../common/CinematicIcons';
import { FilmStripDivider } from '../common/FilmStripDivider';
import { WatchlistFilterBar } from './WatchlistFilterBar';
import { MovieCardPoster } from './MovieCardPoster';
import { MovieDetailDrawer } from './MovieDetailDrawer';
import { ReleaseAlertBanner } from './ReleaseAlertBanner';
import { TicketButton } from '../common/TicketButton';
import { useMovieStore } from '../../store/useMovieStore';
import { Bookmark, Plus } from 'lucide-react';
import { Movie } from '../../types/movie';
import { MovieGridSkeleton } from '../common/LoadingSkeleton';
import { CinematicEmptyState } from '../common/CinematicEmptyState';
import { PWAInstallBanner } from '../common/PWAInstallBanner';

interface WatchlistPageProps {
  onOpenAddModal: (movie?: Movie) => void;
  onShowToast?: (message: string) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  onOpenAddModal,
  onShowToast,
}) => {
  const { movies, filters, loadSampleData, isDbLoaded } = useMovieStore();
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const selectedMovie = selectedMovieId
    ? movies.find((m) => m.id === selectedMovieId) || null
    : null;

  // Apply filters and sorting via useMemo
  const filteredMovies = useMemo(() => {
    return movies
      .filter((movie) => {
        // Only watchlist items
        if (movie.status !== 'watchlist') return false;

        // 1. Content format filter
        if (filters.type !== 'all' && movie.contentType !== filters.type) {
          return false;
        }

        // 2. Genres multi-select filter
        if (filters.genres.length > 0) {
          const matchGenre = filters.genres.some((g: string) => movie.genres.includes(g));
          if (!matchGenre) return false;
        }

        // 3. Platforms multi-select filter
        if (filters.platforms.length > 0) {
          const matchPlatform = filters.platforms.some((p: string) =>
            movie.platforms.includes(p)
          );
          if (!matchPlatform) return false;
        }

        // 4. Languages multi-select filter
        if (filters.languages.length > 0) {
          const matchLang = filters.languages.some((l: string) =>
            movie.languages.includes(l)
          );
          if (!matchLang) return false;
        }

        // 5. Upcoming only toggle
        if (filters.upcomingOnly && movie.isReleased) {
          return false;
        }

        // 6. Search bar (searches title, synopsis, notes)
        if (filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          const matchTitle = movie.title.toLowerCase().includes(q);
          const matchOrig = movie.originalTitle?.toLowerCase().includes(q);
          const matchSynopsis = movie.synopsis?.toLowerCase().includes(q);
          const matchNotes = movie.notes?.toLowerCase().includes(q);
          const matchRec = movie.recommendedBy?.toLowerCase().includes(q);
          if (!matchTitle && !matchOrig && !matchSynopsis && !matchNotes && !matchRec) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'recent') {
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        }
        if (filters.sortBy === 'releaseDate') {
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : Infinity;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : Infinity;
          return dateA - dateB;
        }
        if (filters.sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }
        if (filters.sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        return 0;
      });
  }, [movies, filters]);

  const totalWatchlistCount = useMemo(() => {
    return movies.filter((m) => m.status === 'watchlist').length;
  }, [movies]);

  return (
    <div className="space-y-6">
      {/* 1. Section Header: "YOUR WATCHLIST" in Bebas Neue font with Film-Strip Divider below */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5B301]">
            <Bookmark size={14} />
            <span>Curated Cinema Queue</span>
          </div>
          <h1 className="font-poster text-3xl sm:text-4xl md:text-5xl text-[#F5F5DC] tracking-wider mt-1 drop-shadow-sm">
            YOUR WATCHLIST
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A392] max-w-xl mt-1">
            Browse upcoming premieres, recommended masterworks, and binge-worthy cinema like scrolling a theatre marquee.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TicketButton onClick={() => onOpenAddModal()} variant="gold" size="md">
            Add to Watchlist
          </TicketButton>
        </div>
      </div>

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Film-Strip Divider */}
      <FilmStripDivider label="NOW SHOWING IN YOUR QUEUE" animated={true} />

      {/* In-app Release Alert Banner for newly released movies */}
      <ReleaseAlertBanner onSelectMovie={(movie) => setSelectedMovieId(movie.id)} />

      {/* 2. Filter Bar (Search, Content Type Chips, Multi-selects, Upcoming Toggle, Sort Dropdown) */}
      <WatchlistFilterBar />

      {/* 3. Movie Cards (Poster Grid) OR Loading Skeleton OR Empty State */}
      {!isDbLoaded ? (
        <MovieGridSkeleton count={8} />
      ) : filteredMovies.length === 0 ? (
        totalWatchlistCount === 0 ? (
          <CinematicEmptyState
            type="watchlist"
            onAction={() => onOpenAddModal()}
            onSecondaryAction={loadSampleData}
          />
        ) : (
          <div className="w-full my-8 p-8 sm:p-14 rounded-3xl bg-[#14141C] border border-[#262638] text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <h2 className="font-poster text-2xl sm:text-3xl text-[#F5F5DC] tracking-wider mb-2">
              NO MATCHING CINEMA FOUND
            </h2>
            <p className="text-sm text-[#A3A392] max-w-md mx-auto leading-relaxed mb-6 font-medium">
              No movies match your selected filters. Try clearing or relaxing some filters above.
            </p>
          </div>
        )
      ) : (
        /* Poster Grid with Framer Motion Staggered Animation */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#A3A392]">
            <span className="font-mono tabular-nums">
              Showing {filteredMovies.length} of {totalWatchlistCount} {totalWatchlistCount === 1 ? 'film' : 'films'}
            </span>
            <span className="text-[11px] text-[#737380] hidden sm:inline">
              Click any poster for synopsis, trailer & stream options
            </span>
          </div>

          {/* Grid Layout: 2 columns mobile, 3 tablet, 4-5 laptop, 6 wide desktop */}
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredMovies.map((movie, index) => (
                <MovieCardPoster
                  key={movie.id}
                  movie={movie}
                  index={index}
                  onClick={() => setSelectedMovieId(movie.id)}
                  onPlayTrailer={() => {
                    setSelectedMovieId(movie.id);
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Movie Detail Drawer */}
      <MovieDetailDrawer
        movie={selectedMovie}
        onClose={() => setSelectedMovieId(null)}
        onEdit={(m) => onOpenAddModal(m)}
        onShowToast={onShowToast}
      />
    </div>
  );
};
