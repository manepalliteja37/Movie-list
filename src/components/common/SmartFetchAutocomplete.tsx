import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Search,
  Check,
  Calendar,
  Film,
  X,
  Loader2,
  ExternalLink,
  ArrowRight,
  Info,
} from 'lucide-react';
import { SmartFetchMovieResult, smartFetchMovieMetadata } from '../../services/smartFetchService';
import { ContentType, CONTENT_TYPE_LABELS } from '../../types/movie';
import { FilmReelIcon } from './CinematicIcons';

interface SmartFetchAutocompleteProps {
  titleQuery: string;
  contentType: ContentType;
  onSelectResult: (result: SmartFetchMovieResult) => void;
  onClearQuery?: () => void;
  disabled?: boolean;
}

export const SmartFetchAutocomplete: React.FC<SmartFetchAutocompleteProps> = ({
  titleQuery,
  contentType,
  onSelectResult,
  onClearQuery,
  disabled = false,
}) => {
  const [results, setResults] = useState<SmartFetchMovieResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastFetchedQuery, setLastFetchedQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch results when title changes
  useEffect(() => {
    if (disabled) return;
    const trimmed = titleQuery.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (trimmed === lastFetchedQuery) return;
      setIsLoading(true);
      try {
        const matches = await smartFetchMovieMetadata(trimmed, contentType);
        setResults(matches);
        setLastFetchedQuery(trimmed);
        if (matches.length > 0) {
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Smart Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [titleQuery, contentType, disabled, lastFetchedQuery]);

  const handleManualSearch = async () => {
    const trimmed = titleQuery.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setIsOpen(true);
    try {
      const matches = await smartFetchMovieMetadata(trimmed, contentType);
      setResults(matches);
      setLastFetchedQuery(trimmed);
    } catch (err) {
      console.error('Manual search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: SmartFetchMovieResult) => {
    onSelectResult(result);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Header Bar / Quick Trigger */}
      <div className="flex items-center justify-between mt-1.5 mb-1">
        <div className="flex items-center gap-1.5 text-[11px] text-[#A3A392]">
          <Zap size={12} className="text-[#F5B301] fill-[#F5B301] animate-pulse" />
          <span>
            <strong className="text-[#F5F5DC]">Smart Fetch:</strong> Auto-fills poster, release date & genres
          </span>
        </div>

        <button
          type="button"
          onClick={handleManualSearch}
          disabled={!titleQuery.trim() || isLoading}
          className="px-2 py-0.5 rounded-md bg-[#1C1C28] hover:bg-[#28283C] text-[11px] text-[#F5B301] hover:text-white border border-[#F5B301]/30 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={11} className="animate-spin text-[#F5B301]" />
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <Search size={11} />
              <span>Find Matches</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#12121A] border-2 border-[#F5B301]/60 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-fade-in max-h-[380px] flex flex-col">
          {/* Dropdown Header */}
          <div className="px-3.5 py-2.5 bg-[#181824] border-b border-[#242436] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5B301] animate-ping" />
              <span className="font-semibold text-[#F5F5DC]">
                Cinema Matches Found ({results.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#737380] hover:text-white transition-colors"
              aria-label="Close suggestions"
            >
              <X size={15} />
            </button>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-[#1F1F2E] p-1 flex-1">
            {isLoading && results.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#A3A392] flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-[#F5B301]" />
                <span>Searching Wikipedia, TVMaze & iTunes databases...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="p-5 text-center text-xs text-[#737380]">
                No exact cinema metadata found for "{titleQuery}". You can enter details manually or paste an image link below.
              </div>
            ) : (
              results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="p-2.5 hover:bg-[#1A1A26] rounded-xl cursor-pointer transition-all flex items-center gap-3 group"
                >
                  {/* Poster Thumbnail */}
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-[#0A0A0F] border border-[#2E2E40] shrink-0 relative shadow-sm">
                    {item.posterUrl ? (
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#737380]">
                        <FilmReelIcon size={16} />
                      </div>
                    )}
                  </div>

                  {/* Metadata Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-poster text-base text-[#F5F5DC] group-hover:text-[#F5B301] transition-colors truncate">
                        {item.displayTitle}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-[#242436] text-[#A3A392] shrink-0">
                        {CONTENT_TYPE_LABELS[item.contentType]}
                      </span>
                    </div>

                    {/* Genres & Release Date */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#A3A392] mt-0.5">
                      {item.releaseDate && (
                        <span className="flex items-center gap-1 text-[#F5B301] font-mono">
                          <Calendar size={11} />
                          <span>{item.releaseDate}</span>
                        </span>
                      )}
                      <span>·</span>
                      <span className="truncate">{item.genres.slice(0, 3).join(', ')}</span>
                      {item.languages.length > 0 && item.languages[0] !== 'English' && (
                        <>
                          <span>·</span>
                          <span className="text-[#38BDF8]">{item.languages[0]}</span>
                        </>
                      )}
                    </div>

                    {/* 1-line hook/synopsis */}
                    {item.synopsis && (
                      <p className="text-[10px] text-[#737380] line-clamp-1 mt-1 font-sans">
                        {item.synopsis}
                      </p>
                    )}
                  </div>

                  {/* Auto-fill Action Button */}
                  <div className="shrink-0 pl-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F5B301] hover:bg-[#ffc933] text-[#0A0A0F] font-poster text-xs uppercase tracking-wider font-bold shadow-md flex items-center gap-1 group-hover:scale-105 transition-all cursor-pointer"
                    >
                      <Zap size={11} className="fill-black" />
                      <span>Auto-Fill</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-1.5 bg-[#0C0C12] border-t border-[#1F1F2E] flex items-center justify-between text-[10px] text-[#737380]">
            <span>Click any result to instantly fill poster, date, and genres</span>
            <span className="text-[#A3A392]">Powered by Wikipedia, TVMaze & iTunes</span>
          </div>
        </div>
      )}
    </div>
  );
};
