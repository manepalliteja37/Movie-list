import React, { useState, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  Check,
  Film,
  Layers,
  Star,
  Search,
  Globe,
  Tv,
  Clapperboard,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { FilmStripDivider } from '../common/FilmStripDivider';
import { TicketButton } from '../common/TicketButton';
import { useMovieStore } from '../../store/useMovieStore';
import { WORLD_TOP_100_MOVIES, CuratedTopMovie } from '../../data/worldTop100Movies';

type RegionFilter = 'All' | 'Telugu' | 'Kannada' | 'Malayalam' | 'Hindi' | 'Tamil' | 'World';
type FormatFilter = 'all' | 'movie' | 'series' | 'anime';

export const DiscoverPage: React.FC = () => {
  const { movies, addMovie } = useMovieStore();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('All');
  const [activeFormat, setActiveFormat] = useState<FormatFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(18);

  const handleAddMovie = (item: CuratedTopMovie) => {
    addMovie({
      title: item.title,
      originalTitle: item.originalTitle,
      contentType: item.contentType,
      genres: item.genres,
      languages: item.languages,
      platforms: item.platforms,
      synopsis: item.synopsis,
      recommendedBy: item.recommendedBy,
      releaseDate: `${item.year}-01-01`,
      isReleased: true,
      status: 'watchlist',
    });
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
  };

  const isAlreadyInLibrary = (title: string) => {
    return movies.some((m) => m.title.toLowerCase().trim() === title.toLowerCase().trim());
  };

  // Collect all unique genres from the top 100 list
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    WORLD_TOP_100_MOVIES.forEach((item) => {
      item.genres.forEach((g) => set.add(g));
    });
    return Array.from(set).sort();
  }, []);

  // Filter items based on region, format, search, and genre
  const filteredList = useMemo(() => {
    return WORLD_TOP_100_MOVIES.filter((item) => {
      // Region filter
      if (activeRegion !== 'All' && item.region !== activeRegion) {
        return false;
      }

      // Format filter
      if (activeFormat !== 'all' && item.contentType !== activeFormat) {
        return false;
      }

      // Genre filter
      if (selectedGenre !== 'all' && !item.genres.includes(selectedGenre)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchOrig = item.originalTitle?.toLowerCase().includes(q);
        const matchSynopsis = item.synopsis.toLowerCase().includes(q);
        const matchRec = item.recommendedBy.toLowerCase().includes(q);
        const matchLang = item.languages.some((l) => l.toLowerCase().includes(q));
        const matchGenre = item.genres.some((g) => g.toLowerCase().includes(q));
        if (!matchTitle && !matchOrig && !matchSynopsis && !matchRec && !matchLang && !matchGenre) {
          return false;
        }
      }

      return true;
    });
  }, [activeRegion, activeFormat, selectedGenre, searchQuery]);

  const displayedList = filteredList.slice(0, visibleCount);

  // Region stats counts
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      All: WORLD_TOP_100_MOVIES.length,
      Telugu: WORLD_TOP_100_MOVIES.filter((m) => m.region === 'Telugu').length,
      Kannada: WORLD_TOP_100_MOVIES.filter((m) => m.region === 'Kannada').length,
      Malayalam: WORLD_TOP_100_MOVIES.filter((m) => m.region === 'Malayalam').length,
      Hindi: WORLD_TOP_100_MOVIES.filter((m) => m.region === 'Hindi').length,
      Tamil: WORLD_TOP_100_MOVIES.filter((m) => m.region === 'Tamil').length,
      World: WORLD_TOP_100_MOVIES.filter((m) => m.region === 'World').length,
    };
    return map;
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5B301]">
            <Trophy size={14} className="text-[#F5B301]" />
            <span>World Cinema & Critics Gold Vault</span>
          </div>
          <h1 className="font-poster text-3xl sm:text-4xl md:text-5xl text-[#F5F5DC] tracking-wider mt-1 drop-shadow-sm">
            WORLD TOP 100 CINEMA
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A392] max-w-2xl mt-1 leading-relaxed">
            Curated from global film critics, Sight & Sound, IMDb Top Rated, and Top 10 classics from Indian cinema across 5 languages (Telugu, Kannada, Malayalam, Hindi, Tamil).
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-[#14141C] border border-[#F5B301]/40 text-xs text-[#A3A392] self-start sm:self-center shadow-lg">
          <div className="text-[#F5B301] font-bold font-mono text-[11px] uppercase tracking-wider">
            100 Masterpieces Handpicked
          </div>
          <div className="text-[11px] text-[#A3A392] mt-0.5">
            50 Indian Masterworks · 50 World Cinema & Anime
          </div>
        </div>
      </div>

      <FilmStripDivider label="EXPLORE TOP 100 CINEMA BY REGION & FORMAT" animated={true} />

      {/* 2. Region / Language Filter Tabs */}
      <div className="space-y-3 bg-[#14141C] border border-[#20202E] p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'Tamil', 'World'] as RegionFilter[]).map(
            (region) => {
              const active = activeRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => {
                    setActiveRegion(region);
                    setVisibleCount(18);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#F5B301] text-[#0A0A0F] font-bold shadow-[0_2px_10px_rgba(245,179,1,0.25)]'
                      : 'bg-[#0A0A0F] text-[#A3A392] hover:text-[#F5F5DC] hover:bg-[#1C1C28] border border-[#262638]'
                  }`}
                >
                  <span>{region === 'World' ? 'World Cinema' : region}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      active ? 'bg-[#0A0A0F]/20 text-[#0A0A0F]' : 'bg-[#1C1C28] text-[#F5B301]'
                    }`}
                  >
                    {counts[region]}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* 3. Format Tabs + Search + Genre Filter */}
        <div className="pt-3 border-t border-[#1C1C28] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Format Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-mono text-[#737380] uppercase mr-1 shrink-0">Format:</span>
            {[
              { id: 'all', label: 'All Formats', icon: <Clapperboard size={12} /> },
              { id: 'movie', label: 'Movies', icon: <Film size={12} /> },
              { id: 'series', label: 'Series / TV', icon: <Tv size={12} /> },
              { id: 'anime', label: 'Anime', icon: <Sparkles size={12} /> },
            ].map((fmt) => {
              const active = activeFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => {
                    setActiveFormat(fmt.id as FormatFilter);
                    setVisibleCount(18);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    active
                      ? 'bg-[#1C1C28] border border-[#F5B301] text-[#F5B301] font-semibold'
                      : 'bg-[#0A0A0F] border border-[#262638] text-[#A3A392] hover:text-[#F5F5DC]'
                  }`}
                >
                  {fmt.icon}
                  <span>{fmt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Genre Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737380] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(18);
                }}
                placeholder="Search Top 100 by title, genre, director..."
                className="w-full h-9 pl-9 pr-3 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-xs text-[#F5F5DC] placeholder-[#555566] focus:border-[#F5B301] focus:outline-none transition-all"
              />
            </div>

            {/* Genre Filter Dropdown */}
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setVisibleCount(18);
              }}
              className="h-9 px-3 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-xs text-[#F5F5DC] focus:border-[#F5B301] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#14141C]">All Genres</option>
              {allGenres.map((g) => (
                <option key={g} value={g} className="bg-[#14141C]">
                  {g}
                </option>
              ))}
            </select>

            {/* Reset Filters */}
            {(activeRegion !== 'All' || activeFormat !== 'all' || selectedGenre !== 'all' || searchQuery !== '') && (
              <button
                type="button"
                onClick={() => {
                  setActiveRegion('All');
                  setActiveFormat('all');
                  setSelectedGenre('all');
                  setSearchQuery('');
                  setVisibleCount(18);
                }}
                className="h-9 px-2.5 rounded-xl bg-[#1C1C28] hover:bg-[#28283C] border border-[#28283C] text-xs font-medium text-[#F5B301] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Reset filters"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-[#A3A392] px-1 font-mono">
        <span>
          Showing {displayedList.length} of {filteredList.length} masterworks
        </span>
        <span className="text-[11px] text-[#737380] hidden sm:inline">
          Click "+ Add to Watchlist" to save any title into your collection
        </span>
      </div>

      {/* 5. Grid of Curated Top 100 Cards */}
      {displayedList.length === 0 ? (
        <div className="w-full my-8 p-10 rounded-3xl bg-[#14141C] border border-[#262638] text-center flex flex-col items-center justify-center shadow-2xl space-y-3">
          <Trophy size={36} className="text-[#A3A392]/50" />
          <h2 className="font-poster text-2xl text-[#F5F5DC] tracking-wider">
            NO MATCHING MASTERPIECES FOUND
          </h2>
          <p className="text-xs text-[#A3A392] max-w-md mx-auto">
            No films match your selected region or search criteria. Try adjusting or clearing your filters above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedList.map((item) => {
            const alreadyAdded = isAlreadyInLibrary(item.title) || addedIds[item.id];

            return (
              <div
                key={item.id}
                className="bg-[#14141C] border border-[#262638] rounded-2xl p-5 flex flex-col justify-between hover:border-[#F5B301]/60 transition-all duration-300 shadow-xl hover:shadow-[0_12px_28px_rgba(0,0,0,0.4)] group relative overflow-hidden"
              >
                <div>
                  {/* Rank Header + Content Type & Region Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#F5B301]/20 border border-[#F5B301]/50 text-[#F5B301] text-xs font-mono font-bold">
                      #{item.rank} TOP 100
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#0A0A0F] border border-[#262638] text-[#F5B301] text-[10px] font-mono uppercase font-bold">
                        {item.contentType}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#1C1C28] text-[#A3A392] text-[10px] font-mono font-medium">
                        {item.region}
                      </span>
                    </div>
                  </div>

                  {/* Title & Native Script Title */}
                  <h3 className="font-poster text-2xl text-[#F5F5DC] tracking-wide group-hover:text-[#F5B301] transition-colors mt-1">
                    {item.title}
                  </h3>
                  {item.originalTitle && item.originalTitle !== item.title && (
                    <div className="text-xs text-[#A3A392] font-mono mt-0.5">
                      {item.originalTitle} ({item.year})
                    </div>
                  )}

                  {/* Languages & Genres */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono text-[#F5B301]/90">
                      {item.languages.join(' · ')}
                    </span>
                    <span className="text-[11px] text-[#555568]">•</span>
                    <span className="text-[11px] text-[#A3A392]">
                      {item.genres.join(', ')}
                    </span>
                  </div>

                  {/* Synopsis */}
                  <p className="text-xs text-[#8E8E9E] leading-relaxed line-clamp-3 mt-2.5">
                    {item.synopsis}
                  </p>

                  {/* Critic / Recommendation Note */}
                  <div className="mt-3.5 py-2 px-3 rounded-xl bg-[#0E0E14] border border-[#20202E] text-[11px] text-[#A3A392] flex items-center gap-2">
                    <Star size={13} className="text-[#F5B301] shrink-0" />
                    <span className="truncate font-mono text-[10.5px] text-[#C5C5B5]">
                      {item.recommendedBy}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Platforms & Add Action */}
                <div className="pt-4 mt-4 border-t border-[#20202E] flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#737380] truncate max-w-[50%]">
                    On {item.platforms.join(', ')}
                  </span>

                  {alreadyAdded ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5B301]/10 border border-[#F5B301]/40 text-[#F5B301] text-xs font-mono font-medium">
                      <Check size={14} /> In Watchlist
                    </span>
                  ) : (
                    <TicketButton
                      onClick={() => handleAddMovie(item)}
                      variant="gold"
                      size="sm"
                    >
                      + Add to Watchlist
                    </TicketButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filteredList.length && (
        <div className="flex justify-center pt-4">
          <TicketButton
            onClick={() => setVisibleCount((prev) => prev + 18)}
            variant="gold"
            size="md"
          >
            Load More Cinema ({filteredList.length - visibleCount} Remaining)
          </TicketButton>
        </div>
      )}
    </div>
  );
};
