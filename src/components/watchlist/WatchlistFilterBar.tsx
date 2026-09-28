import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Film,
  Layers,
  Globe,
  MonitorPlay,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  ContentType,
  CONTENT_TYPE_LABELS,
  COMMON_GENRES,
  COMMON_PLATFORMS,
  COMMON_LANGUAGES,
  SortOption,
} from '../../types/movie';
import { useMovieStore } from '../../store/useMovieStore';
import { MultiSelectDropdown } from '../common/MultiSelectDropdown';

const CONTENT_TYPES: ContentType[] = [
  'movie',
  'series',
  'anime',
  'shortfilm',
  'shortseries',
];

const WATCHLIST_SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recent', label: 'Recently Added' },
  { id: 'releaseDate', label: 'Release Date (Soonest)' },
  { id: 'alphabetical', label: 'Alphabetical (A-Z)' },
  { id: 'rating', label: 'Highest Rating' },
];

const WATCHED_SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recentWatched', label: 'Recently Watched' },
  { id: 'rating', label: 'Rating (High → Low)' },
  { id: 'alphabetical', label: 'Title (A-Z)' },
];

interface WatchlistFilterBarProps {
  isWatchedPage?: boolean;
}

export const WatchlistFilterBar: React.FC<WatchlistFilterBarProps> = ({ isWatchedPage = false }) => {
  const { filters, setFilters, resetFilters } = useMovieStore();

  const sortOptions = isWatchedPage ? WATCHED_SORT_OPTIONS : WATCHLIST_SORT_OPTIONS;

  const isFiltered =
    filters.type !== 'all' ||
    filters.genres.length > 0 ||
    filters.platforms.length > 0 ||
    filters.languages.length > 0 ||
    (!isWatchedPage && filters.upcomingOnly) ||
    filters.search !== '' ||
    filters.sortBy !== (isWatchedPage ? 'recentWatched' : 'recent');

  return (
    <div className="space-y-3.5 bg-[#14141C] border border-[#20202E] p-4 sm:p-5 rounded-2xl shadow-xl">
      {/* 1. Search Bar at Top (searches title, synopsis, notes) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737380] pointer-events-none"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder={
              isWatchedPage
                ? 'Search watched films by title, synopsis, or personal review notes...'
                : 'Search watchlist by title, synopsis, director, or viewing notes...'
            }
            className="w-full h-11 pl-10 pr-9 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-sm text-[#F5F5DC] placeholder-[#555566] focus:border-[#F5B301] focus:ring-1 focus:ring-[#F5B301]/40 focus:outline-none transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737380] hover:text-[#F5F5DC] p-1"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Sort By Dropdown */}
        <div className="relative shrink-0 flex items-center gap-2">
          <div className="flex items-center h-11 px-3 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-xs text-[#A3A392]">
            <ArrowUpDown size={14} className="text-[#F5B301] mr-2 shrink-0" />
            <span className="text-[11px] text-[#737380] mr-1 hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ sortBy: e.target.value as SortOption })}
              className="bg-transparent text-[#F5F5DC] font-medium focus:outline-none cursor-pointer pr-1"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#14141C] text-[#F5F5DC]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button (Desktop & Mobile) */}
          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              title="Reset all filters and search"
              className="h-11 px-3 rounded-xl bg-[#1C1C28] hover:bg-[#28283C] border border-[#28283C] text-xs font-medium text-[#F5B301] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Content Type Filter (horizontally scrollable chips on mobile, inline on desktop) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none touch-pan-x -mx-1 px-1 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setFilters({ type: 'all' })}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${filters.type === 'all'
            ? 'bg-[#F5B301] text-[#0A0A0F] font-bold shadow-[0_2px_10px_rgba(245,179,1,0.25)]'
            : 'bg-[#0A0A0F] text-[#A3A392] hover:text-[#F5F5DC] hover:bg-[#1C1C28] border border-[#262638]'
            }`}
        >
          <Film size={13} />
          <span>All Content</span>
        </button>

        {CONTENT_TYPES.map((type) => {
          const active = filters.type === type;
          return (
            <button
              type="button"
              key={type}
              onClick={() => setFilters({ type })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${active
                ? 'bg-[#F5B301] text-[#0A0A0F] font-bold shadow-[0_2px_10px_rgba(245,179,1,0.25)]'
                : 'bg-[#0A0A0F] text-[#A3A392] hover:text-[#F5F5DC] hover:bg-[#1C1C28] border border-[#262638]'
                }`}
            >
              <span>{CONTENT_TYPE_LABELS[type]}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Dropdowns Row & Upcoming Only Toggle */}
      <div className="pt-2 border-t border-[#1C1C28] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Genre multi-select dropdown */}
          <MultiSelectDropdown
            label="Genre"
            options={COMMON_GENRES}
            selected={filters.genres}
            onChange={(genres) => setFilters({ genres })}
            icon={<Layers size={13} />}
          />

          {/* Platform multi-select dropdown */}
          <MultiSelectDropdown
            label="Platform"
            options={COMMON_PLATFORMS}
            selected={filters.platforms}
            onChange={(platforms) => setFilters({ platforms })}
            icon={<MonitorPlay size={13} />}
          />

          {/* Language multi-select dropdown */}
          <MultiSelectDropdown
            label="Language"
            options={COMMON_LANGUAGES}
            selected={filters.languages}
            onChange={(languages) => setFilters({ languages })}
            icon={<Globe size={13} />}
          />
        </div>

        {/* Upcoming Only Toggle (Watchlist page only) */}
        {!isWatchedPage && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2.5 text-xs font-medium text-[#A3A392] cursor-pointer select-none bg-[#0A0A0F] border border-[#262638] px-3 py-1.5 rounded-xl hover:border-[#38384d] transition-colors upcoming-toggle-label">
              <input
                type="checkbox"
                checked={filters.upcomingOnly}
                onChange={(e) => setFilters({ upcomingOnly: e.target.checked })}
                className="sr-only"
              />

              {/* Custom Image-Grounded Toggle UI (Pill Track + White Circular Handle + Directional Chevron) */}
              <div
                className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0 upcoming-toggle-track toggle-track ${filters.upcomingOnly ? 'bg-[#F5B301]' : 'bg-[#1E1E2A]'
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${filters.upcomingOnly ? 'translate-x-[20px]' : 'translate-x-0'
                    }`}
                >
                  {filters.upcomingOnly ? (
                    <ChevronLeft size={13} className="text-[#1A1A24] stroke-[2.5]" />
                  ) : (
                    <ChevronRight size={13} className="text-[#1A1A24] stroke-[2.5]" />
                  )}
                </div>
              </div>

              <span className={filters.upcomingOnly ? 'text-[#F5B301] font-semibold' : 'text-[#A3A392]'}>
                Upcoming Only
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
