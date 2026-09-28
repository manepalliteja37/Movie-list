import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Star,
  Sparkles,
  Film,
  Calendar,
  Layers,
  TrendingUp,
  Tv,
  Clapperboard,
} from 'lucide-react';
import { FilmStripDivider } from '../common/FilmStripDivider';
import { WatchlistFilterBar } from '../watchlist/WatchlistFilterBar';
import { MovieCardPoster } from '../watchlist/MovieCardPoster';
import { MovieDetailDrawer } from '../watchlist/MovieDetailDrawer';
import { useMovieStore } from '../../store/useMovieStore';
import { TicketButton } from '../common/TicketButton';
import { Movie } from '../../types/movie';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { ShareCollectionModal } from './ShareCollectionModal';
import { MovieGridSkeleton } from '../common/LoadingSkeleton';
import { CinematicEmptyState } from '../common/CinematicEmptyState';

interface WatchedPageProps {
  onOpenAddModal: (movie?: Movie) => void;
  onShowToast?: (message: string) => void;
}

export const WatchedPage: React.FC<WatchedPageProps> = ({
  onOpenAddModal,
  onShowToast,
}) => {
  const { movies, filters, isDbLoaded } = useMovieStore();
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [isShareCollectionOpen, setIsShareCollectionOpen] = useState(false);

  const selectedMovie = selectedMovieId
    ? movies.find((m) => m.id === selectedMovieId) || null
    : null;

  // 1. Calculate All Watched Movies
  const allWatched = useMemo(() => {
    return movies.filter((m) => m.status === 'watched');
  }, [movies]);

  // 2. Comprehensive Stats Breakdown
  const stats = useMemo(() => {
    const total = allWatched.length;

    // Counts by content type
    const movieCount = allWatched.filter((m) => m.contentType === 'movie').length;
    const seriesCount = allWatched.filter(
      (m) => m.contentType === 'series' || m.contentType === 'shortseries'
    ).length;
    const animeCount = allWatched.filter((m) => m.contentType === 'anime').length;
    const shortfilmCount = allWatched.filter((m) => m.contentType === 'shortfilm').length;

    // This month watched
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const thisMonthWatched = allWatched.filter((m) => {
      if (!m.watchedDate) return false;
      const d = new Date(m.watchedDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;

    // Average rating
    const rated = allWatched.filter((m) => typeof m.rating === 'number' && m.rating > 0);
    const avgRating =
      rated.length > 0
        ? (rated.reduce((acc, m) => acc + (m.rating || 0), 0) / rated.length).toFixed(1)
        : '0.0';

    // Favourite genre based on highest count
    const genreCounts: Record<string, number> = {};
    allWatched.forEach((m) => {
      m.genres.forEach((g) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    const favouriteGenre =
      sortedGenres.length > 0 ? sortedGenres[0][0] : 'None yet';
    const favouriteGenreCount =
      sortedGenres.length > 0 ? sortedGenres[0][1] : 0;

    return {
      total,
      movieCount,
      seriesCount,
      animeCount,
      shortfilmCount,
      thisMonthWatched,
      avgRating,
      ratedCount: rated.length,
      favouriteGenre,
      favouriteGenreCount,
    };
  }, [allWatched]);

  // 3. Filtered & Sorted Watched Movies
  const filteredWatchedMovies = useMemo(() => {
    return allWatched
      .filter((movie) => {
        // Content format filter
        if (filters.type !== 'all' && movie.contentType !== filters.type) return false;

        // Genres multi-select
        if (
          filters.genres.length > 0 &&
          !filters.genres.some((g: string) => movie.genres.includes(g))
        ) {
          return false;
        }

        // Platforms multi-select
        if (
          filters.platforms.length > 0 &&
          !filters.platforms.some((p: string) => movie.platforms.includes(p))
        ) {
          return false;
        }

        // Languages multi-select
        if (
          filters.languages.length > 0 &&
          !filters.languages.some((l: string) => movie.languages.includes(l))
        ) {
          return false;
        }

        // Search text
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = movie.title.toLowerCase().includes(q);
          const matchOrig = movie.originalTitle?.toLowerCase().includes(q);
          const matchSynopsis = movie.synopsis?.toLowerCase().includes(q);
          const matchNotes = movie.notes?.toLowerCase().includes(q);
          const matchShare = movie.shareCaption?.toLowerCase().includes(q);
          const matchRec = movie.recommendedBy?.toLowerCase().includes(q);
          if (
            !matchTitle &&
            !matchOrig &&
            !matchSynopsis &&
            !matchNotes &&
            !matchShare &&
            !matchRec
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Sort options: Recently Watched, Rating (high→low), Title
        if (filters.sortBy === 'recentWatched' || filters.sortBy === 'recent') {
          const dateA = a.watchedDate ? new Date(a.watchedDate).getTime() : new Date(a.addedAt).getTime();
          const dateB = b.watchedDate ? new Date(b.watchedDate).getTime() : new Date(b.addedAt).getTime();
          return dateB - dateA;
        }
        if (filters.sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (filters.sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }
        if (filters.sortBy === 'releaseDate') {
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : Infinity;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : Infinity;
          return dateA - dateB;
        }
        return 0;
      });
  }, [allWatched, filters]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5B301]">
            <CheckCircle2 size={14} />
            <span>Archive & Log</span>
          </div>
          <h1 className="font-poster text-3xl sm:text-4xl md:text-5xl text-[#F5F5DC] tracking-wider mt-1 drop-shadow-sm">
            WATCHED ARCHIVE
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A392] max-w-xl mt-1">
            Your personal record of viewed cinematic masterworks, ratings, and thoughts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsShareCollectionOpen(true)}
            className="ticket-notch-button py-2.5 px-4 bg-[#1C1C28] hover:bg-[#252536] border border-[#F5B301]/50 text-[#F5B301] hover:text-[#FFD700] font-poster text-sm tracking-wider uppercase inline-flex items-center gap-2 cursor-pointer shadow-md transition-all"
            title="Share curated collection with friends"
          >
            <Share2 size={15} />
            <span>Share My Collection</span>
          </button>

          <TicketButton
            onClick={() => onOpenAddModal()}
            variant="crimson"
            size="md"
          >
            + Log Watched Film
          </TicketButton>
        </div>
      </div>

      {/* 4. Stats Header at Top */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Watched (Movies, Series, Anime) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#14141C] border border-[#28283C] flex flex-col justify-between hover:border-[#F5B301]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#737380] mb-2 font-mono uppercase tracking-wider">
            <span>Total Watched</span>
            <Film size={16} className="text-[#F5B301]" />
          </div>
          <div className="font-poster text-3xl sm:text-4xl text-[#F5F5DC] tracking-wider leading-none">
            {stats.total} <span className="text-sm font-sans font-medium text-[#737380]">titles</span>
          </div>
          <div className="text-[11px] text-[#A3A392] mt-2 pt-2 border-t border-[#20202E] truncate">
            <strong className="text-[#F5F5DC]">{stats.movieCount}</strong> movies ·{' '}
            <strong className="text-[#F5F5DC]">{stats.seriesCount}</strong> series ·{' '}
            <strong className="text-[#F5F5DC]">{stats.animeCount}</strong> anime
          </div>
        </div>

        {/* Metric 2: This Month Watched */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#14141C] border border-[#28283C] flex flex-col justify-between hover:border-[#F5B301]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#737380] mb-2 font-mono uppercase tracking-wider">
            <span>This Month</span>
            <Calendar size={16} className="text-[#38BDF8]" />
          </div>
          <div className="font-poster text-3xl sm:text-4xl text-[#F5F5DC] tracking-wider leading-none">
            {stats.thisMonthWatched} <span className="text-sm font-sans font-medium text-[#737380]">watched</span>
          </div>
          <div className="text-[11px] text-[#A3A392] mt-2 pt-2 border-t border-[#20202E] truncate">
            Logged in {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Metric 3: Average Rating */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#14141C] border border-[#28283C] flex flex-col justify-between hover:border-[#F5B301]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#737380] mb-2 font-mono uppercase tracking-wider">
            <span>Average Rating</span>
            <Star size={16} className="fill-[#F5B301] text-[#F5B301]" />
          </div>
          <div className="font-poster text-3xl sm:text-4xl text-[#F5B301] tracking-wider leading-none flex items-baseline gap-1">
            <span>{stats.avgRating}</span>
            <span className="text-sm font-sans font-medium text-[#737380]">/ 10</span>
          </div>
          <div className="text-[11px] text-[#A3A392] mt-2 pt-2 border-t border-[#20202E] truncate">
            Based on {stats.ratedCount} rated films & series
          </div>
        </div>

        {/* Metric 4: Favourite Genre */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#14141C] border border-[#28283C] flex flex-col justify-between hover:border-[#F5B301]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#737380] mb-2 font-mono uppercase tracking-wider">
            <span>Favourite Genre</span>
            <Layers size={16} className="text-[#FF5A6E]" />
          </div>
          <div className="font-poster text-2xl sm:text-3xl text-[#F5F5DC] tracking-wide leading-none truncate">
            {stats.favouriteGenre}
          </div>
          <div className="text-[11px] text-[#A3A392] mt-2 pt-2 border-t border-[#20202E] truncate">
            {stats.favouriteGenreCount > 0
              ? `${stats.favouriteGenreCount} films in this genre`
              : 'Log films to calculate'}
          </div>
        </div>
      </div>

      {/* Film Strip Section Divider */}
      <FilmStripDivider label="ARCHIVED & STAMPED ENTRIES" animated={true} />

      {/* Filter and Search Controls (Customized for Watched Page) */}
      <WatchlistFilterBar isWatchedPage={true} />

      {/* Content Area: Empty State vs Cards vs Skeleton */}
      {!isDbLoaded ? (
        <MovieGridSkeleton count={8} />
      ) : filteredWatchedMovies.length === 0 ? (
        allWatched.length === 0 ? (
          <CinematicEmptyState
            type="watched"
            onAction={() => onOpenAddModal()}
          />
        ) : (
          <div className="w-full my-8 p-8 sm:p-14 rounded-3xl bg-[#14141C] border border-[#262638] text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <h2 className="font-poster text-2xl sm:text-3xl text-[#F5F5DC] tracking-wider mb-2">
              NO MATCHING WATCHED FILMS
            </h2>
            <p className="text-sm text-[#A3A392] max-w-md mx-auto leading-relaxed mb-6 font-medium">
              No watched entries match your active filters. Try clearing filters or search terms.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#A3A392]">
            <span className="font-mono tabular-nums">
              Showing {filteredWatchedMovies.length} of {allWatched.length} watched {allWatched.length === 1 ? 'title' : 'titles'}
            </span>
            <span className="text-[11px] text-[#737380] hidden sm:inline">
              Sorted by {filters.sortBy === 'rating' ? 'Rating' : filters.sortBy === 'alphabetical' ? 'Title' : 'Recently Watched'}
            </span>
          </div>

          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredWatchedMovies.map((movie, index) => (
                <MovieCardPoster
                  key={movie.id}
                  movie={movie}
                  index={index}
                  onClick={() => setSelectedMovieId(movie.id)}
                  onPlayTrailer={() => setSelectedMovieId(movie.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Detail Drawer (With Watched-State Action Buttons: Share, Move to Watchlist, Edit rating) */}
      <MovieDetailDrawer
        movie={selectedMovie}
        onClose={() => setSelectedMovieId(null)}
        onEdit={(m) => onOpenAddModal(m)}
        onShowToast={onShowToast}
      />

      {/* Share My Watched Collection Modal */}
      <ShareCollectionModal
        isOpen={isShareCollectionOpen}
        onClose={() => setIsShareCollectionOpen(false)}
        watchedMovies={allWatched}
        onShowToast={onShowToast}
      />
    </div>
  );
};
