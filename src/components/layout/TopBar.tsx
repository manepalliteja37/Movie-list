import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FilmReelIcon } from '../common/CinematicIcons';
import { useMovieStore } from '../../store/useMovieStore';

interface TopBarProps {
  onOpenAddModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = () => {
  const { filters, setFilters } = useMovieStore();
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleClearSearch = () => {
    setFilters({ search: '' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0F]/95 backdrop-blur-md border-b border-[#20202E]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Title Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer focus:outline-none shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#14141C] border border-[#28283C] flex items-center justify-center text-[#F5B301] shadow-[0_0_12px_rgba(245,179,1,0.15)] group-hover:border-[#F5B301]/50 group-hover:scale-105 transition-transform duration-300">
            <FilmReelIcon size={20} className="sm:w-[22px] sm:h-[22px] animate-spin-slow" />
          </div>
          <span className="hidden min-[350px]:inline-block font-poster text-lg sm:text-2xl tracking-wider text-[#F5F5DC] group-hover:text-[#F5B301] transition-colors leading-none">
            MOVIELIST
          </span>
        </Link>

        {/* Zone 2: Search bar */}
        <div className="flex-1 max-w-md mx-1 sm:mx-4 md:mx-6 min-w-0">
          <div className="relative flex items-center">
            <Search
              size={15}
              className="absolute left-3 text-[#A3A392] pointer-events-none stroke-[2]"
            />
            <input
              id="global-movie-search"
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search movies, genres..."
              className="w-full h-9 sm:h-10 pl-8 sm:pl-9 pr-8 sm:pr-9 bg-[#14141C] border border-[#262638] rounded-xl text-xs sm:text-sm text-[#F5F5DC] placeholder-[#737380] focus:outline-none focus:border-[#F5B301] focus:ring-1 focus:ring-[#F5B301]/50 transition-all truncate"
            />
            {!filters.search && (
              <span className="hidden sm:inline-block absolute right-3 px-1.5 py-0.5 rounded bg-[#0A0A0F] border border-[#262638] text-[10px] font-mono text-[#737380]">
                /
              </span>
            )}
            {filters.search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 sm:right-3 text-[#737380] hover:text-[#F5F5DC] transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#14141C] border border-[#262638] hover:border-[#F5B301]/50 flex items-center justify-center text-[#F5F5DC] hover:text-[#F5B301] transition-colors focus:outline-none cursor-pointer"
            aria-label="Settings and Profile"
            title="Settings & Preferences"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
