import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Share2,
  Copy,
  Check,
  Star,
  Film,
  Ticket,
  Sparkles,
  ExternalLink,
  Plus,
  BookmarkPlus,
  Clock,
  ArrowLeft,
  Calendar,
  MessageSquare,
  History,
  Trash2,
} from 'lucide-react';
import { FilmStripDivider } from '../common/FilmStripDivider';
import { useMovieStore } from '../../store/useMovieStore';
import { TicketButton } from '../common/TicketButton';
import { FilmReelIcon, TicketIcon } from '../common/CinematicIcons';
import {
  decodeMovieShareData,
  decodeCollectionShareData,
  ShareMoviePayload,
  ShareCollectionPayload,
} from '../../services/shareService';
import { Movie, ContentType } from '../../types/movie';
import { CinematicEmptyState } from '../common/CinematicEmptyState';
import { CinematicPosterFallback } from '../common/CinematicPosterFallback';

interface SharePageProps {
  onShowToast?: (message: string) => void;
  onOpenAddModal?: (movie?: Movie) => void;
}

export const SharePage: React.FC<SharePageProps> = ({
  onShowToast,
  onOpenAddModal,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { movies, addMovie, settings, clearShareHistory } = useMovieStore();

  const [copiedTitle, setCopiedTitle] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Check URL query parameters:
  // 1. /share?data=... (single movie recommendation)
  // 2. /share?collection=... (shared collection)
  const encodedSingleMovie = searchParams.get('data');
  const encodedCollection = searchParams.get('collection');

  const [sharedMovie, setSharedMovie] = useState<ShareMoviePayload | null>(null);
  const [sharedCollection, setSharedCollection] = useState<ShareCollectionPayload | null>(null);

  useEffect(() => {
    if (encodedSingleMovie) {
      const decoded = decodeMovieShareData(encodedSingleMovie);
      setSharedMovie(decoded);
    } else {
      setSharedMovie(null);
    }

    if (encodedCollection) {
      const decoded = decodeCollectionShareData(encodedCollection);
      setSharedCollection(decoded);
    } else {
      setSharedCollection(null);
    }
  }, [encodedSingleMovie, encodedCollection]);

  // Handle adding shared movie to recipient's watchlist
  const handleAddToWatchlist = async (payload: ShareMoviePayload) => {
    // Check if already in watchlist or library
    const existing = movies.find(
      (m) => m.title.toLowerCase().trim() === payload.t.toLowerCase().trim()
    );

    if (existing) {
      onShowToast?.(`"${payload.t}" is already in your ${existing.status}!`);
      return;
    }

    await addMovie({
      title: payload.t,
      originalTitle: payload.ot,
      contentType: (payload.c as ContentType) || 'movie',
      genres: payload.g || ['Drama'],
      languages: payload.l || ['English'],
      platforms: payload.p || ['Theatre'],
      releaseDate: payload.y ? `${payload.y}-01-01` : undefined,
      isReleased: true,
      synopsis: payload.s || '',
      posterUrl: payload.po,
      status: 'watchlist',
      notes: payload.n ? `Recommended: "${payload.n}"` : undefined,
      recommendedBy: payload.rb || 'Shared link recommendation',
    });

    setAddedSuccess(true);
    onShowToast?.(`Added "${payload.t}" to your watchlist! 🎟️`);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  // Copy title to clipboard
  const handleCopyTitle = (title: string) => {
    navigator.clipboard.writeText(title);
    setCopiedTitle(true);
    onShowToast?.(`Copied "${title}" to clipboard!`);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  // ==========================================
  // CASE 1: SHARED SINGLE MOVIE PUBLIC VIEW
  // ==========================================
  if (sharedMovie) {
    const isAlreadySaved = movies.some(
      (m) => m.title.toLowerCase().trim() === sharedMovie.t.toLowerCase().trim()
    );

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top return banner */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#A3A392] hover:text-[#F5B301] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Open Movielist Home</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-[#F5B301] font-mono">
            <Sparkles size={13} />
            <span>Shared Recommendation Pass</span>
          </div>
        </div>

        {/* Vintage Ticket Stub Display */}
        <div
          className="bg-[#161622] border-2 border-[#383852] rounded-3xl overflow-hidden shadow-2xl relative text-[#F5F5DC]"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85), 0 0 20px rgba(245,179,1,0.1)',
          }}
        >
          {/* Header Ticket Marquee */}
          <div className="bg-[#1C1C2C] px-6 py-4 border-b border-[#2E2E44] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
                <FilmReelIcon size={18} />
              </div>
              <div>
                <span className="font-mono text-[11px] tracking-widest text-[#F5B301] uppercase font-bold">
                  OFFICIAL ADMIT ONE · {sharedMovie.c.toUpperCase()}
                </span>
                <div className="text-[11px] text-[#8E8EA0]">
                  CURATED RECOMMENDATION PASS
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-[#F5B301]">VERIFIED</div>
              <div className="text-[10px] text-[#737380] uppercase">TICKET</div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 space-y-6 relative">
            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
              {/* Poster */}
              <div className="w-36 sm:w-44 aspect-[2/3] rounded-2xl overflow-hidden bg-[#0A0A0F] border-2 border-[#383852] shrink-0 shadow-2xl self-center sm:self-start">
                {sharedMovie.po ? (
                  <img
                    src={sharedMovie.po}
                    alt={sharedMovie.t}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CinematicPosterFallback
                    title={sharedMovie.t}
                    originalTitle={sharedMovie.ot}
                    contentType={sharedMovie.c as ContentType}
                    genres={sharedMovie.g}
                    year={sharedMovie.y}
                    platforms={sharedMovie.p}
                    aspect="portrait"
                    showBillingBlock={false}
                  />
                )}
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="font-poster text-3xl sm:text-5xl text-[#F5F5DC] tracking-wide leading-tight">
                    {sharedMovie.t}
                  </h1>
                  {sharedMovie.y && (
                    <div className="text-sm font-mono text-[#F5B301] mt-0.5">
                      Release Year: {sharedMovie.y}
                    </div>
                  )}
                  {sharedMovie.ot && sharedMovie.ot !== sharedMovie.t && (
                    <div className="text-sm text-[#A3A392] font-telugu italic mt-1">
                      {sharedMovie.ot}
                    </div>
                  )}
                </div>

                {/* Rating Badge */}
                {sharedMovie.r ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A0A0F] border border-[#F5B301]/50">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.round((sharedMovie.r || 0) / 2)
                              ? 'fill-[#F5B301] text-[#F5B301]'
                              : 'text-[#3E3E52]'
                          }
                        />
                      ))}
                    </div>
                    <span className="font-poster text-lg text-[#F5B301] font-bold">
                      {sharedMovie.r} / 10
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-[#8E8EA0] italic">
                    Saved to cinema watchlist
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#A3A392] pt-1">
                  <div>
                    <span className="text-[#737380] block text-[10px] uppercase">Genres</span>
                    <span className="text-[#F5F5DC] font-medium">{sharedMovie.g.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[#737380] block text-[10px] uppercase">Streaming On</span>
                    <span className="text-[#F5B301] font-medium">{sharedMovie.p.join(', ')}</span>
                  </div>
                </div>

                {/* Synopsis */}
                {sharedMovie.s && (
                  <p className="text-xs text-[#C4C4B5] leading-relaxed pt-2 border-t border-[#262638]">
                    {sharedMovie.s}
                  </p>
                )}
              </div>
            </div>

            {/* Handwritten Personal Review Note */}
            {sharedMovie.n && (
              <div className="p-4 rounded-2xl bg-[#0F0F18] border-l-4 border-[#F5B301] shadow-inner space-y-1">
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#F5B301]">
                  WHY YOU SHOULD WATCH THIS:
                </div>
                <div className="font-handwriting text-2xl text-[#FFF8E7] leading-relaxed">
                  “{sharedMovie.n}”
                </div>
              </div>
            )}

            {/* Perforated Tear Line */}
            <div className="relative my-6 flex items-center justify-between">
              <div className="w-6 h-6 -ml-9 rounded-full bg-[#0A0A0F] border-r-2 border-[#383852]" />
              <div className="flex-1 border-t-2 border-dashed border-[#2E2E44] mx-2" />
              <div className="w-6 h-6 -mr-9 rounded-full bg-[#0A0A0F] border-l-2 border-[#383852]" />
            </div>

            {/* Recommender footer info */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
                  <Ticket size={14} />
                </div>
                <div>
                  <div className="text-[10px] text-[#737380] uppercase">Curated by</div>
                  <div className="font-semibold text-[#F5F5DC]">{sharedMovie.rb || 'Friend'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FilmReelIcon size={16} className="text-[#F5B301]" />
                <span className="font-poster text-lg text-[#F5F5DC] tracking-wider">
                  MOVIELIST
                </span>
              </div>
            </div>

            {/* CALL TO ACTIONS */}
            <div className="pt-4 border-t border-[#242436] flex flex-col sm:flex-row items-center gap-3">
              {/* CTA 1: Open in Movielist to add to your watchlist */}
              <button
                type="button"
                onClick={() => handleAddToWatchlist(sharedMovie)}
                disabled={isAlreadySaved || addedSuccess}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-[#F5B301] hover:bg-[#ffc629] text-[#0A0A0F] font-poster text-base uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(245,179,1,0.3)] cursor-pointer disabled:opacity-75 disabled:cursor-default transition-all"
              >
                {isAlreadySaved ? (
                  <>
                    <Check size={18} />
                    <span>Already in Your Library</span>
                  </>
                ) : addedSuccess ? (
                  <>
                    <Check size={18} />
                    <span>Added to Watchlist! 🎟️</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={18} />
                    <span>Add to My Watchlist</span>
                  </>
                )}
              </button>

              {/* CTA 2: Copy title for users who don't have the app */}
              <button
                type="button"
                onClick={() => handleCopyTitle(sharedMovie.t)}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] text-[#F5F5DC] hover:text-[#F5B301] font-poster text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {copiedTitle ? <Check size={16} className="text-[#F5B301]" /> : <Copy size={16} />}
                <span>{copiedTitle ? 'Title Copied!' : 'Copy Title'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 2: SHARED COLLECTION PUBLIC VIEW
  // ==========================================
  if (sharedCollection) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#A3A392] hover:text-[#F5B301] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Open Movielist Home</span>
          </button>
          <div className="text-xs text-[#F5B301] font-mono flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Shared Cinephile Collection</span>
          </div>
        </div>

        {/* Collection Banner Header */}
        <div className="bg-[#14141C] border border-[#28283C] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase text-[#F5B301] tracking-widest flex items-center gap-2 mb-2">
                <FilmReelIcon size={14} />
                <span>Curated Recommendations Pass · {sharedCollection.d}</span>
              </div>
              <h1 className="font-poster text-3xl sm:text-5xl text-[#F5F5DC] tracking-wider">
                {sharedCollection.t}
              </h1>
              <p className="text-xs sm:text-sm text-[#A3A392] mt-2">
                Curated by <strong className="text-[#F5B301]">{sharedCollection.u}</strong> ·{' '}
                {sharedCollection.m.length} hand-picked films to watch
              </p>
            </div>

            <div className="hidden sm:block text-right shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301] mx-auto mb-1">
                <TicketIcon size={28} />
              </div>
              <span className="font-mono text-[10px] text-[#737380] uppercase">COLLECTION PASS</span>
            </div>
          </div>
        </div>

        <FilmStripDivider label="RECOMMENDED TITLES" />

        {/* Grid of Shared Movies in Collection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sharedCollection.m.map((movie, idx) => {
            const isSaved = movies.some(
              (m) => m.title.toLowerCase().trim() === movie.t.toLowerCase().trim()
            );

            return (
              <div
                key={idx}
                className="bg-[#14141C] border border-[#28283C] hover:border-[#F5B301]/50 rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-lg"
              >
                <div className="space-y-3">
                  {/* Poster Thumbnail */}
                  <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#0A0A0F] border border-[#222232] relative">
                    {movie.po ? (
                      <img
                        src={movie.po}
                        alt={movie.t}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <CinematicPosterFallback
                        title={movie.t}
                        originalTitle={movie.ot}
                        contentType={movie.c as ContentType}
                        genres={movie.g}
                        year={movie.y}
                        platforms={movie.p}
                        aspect="portrait"
                        showBillingBlock={false}
                      />
                    )}

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-[#0A0A0F]/85 font-mono text-[10px] text-[#F5B301] font-bold">
                      #{idx + 1}
                    </div>

                    {movie.r && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-[#0A0A0F]/85 font-mono text-[10px] text-[#F5B301] flex items-center gap-1 font-bold">
                        <Star size={10} className="fill-[#F5B301]" />
                        {movie.r}/10
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-poster text-xl text-[#F5F5DC] truncate tracking-wide">
                      {movie.t}
                    </h3>
                    {movie.y && (
                      <div className="text-xs text-[#F5B301] font-mono">{movie.y}</div>
                    )}
                    {movie.ot && (
                      <div className="text-[11px] text-[#8E8EA0] font-telugu italic truncate">
                        {movie.ot}
                      </div>
                    )}
                  </div>

                  {/* Handwritten Note if present */}
                  {movie.n && (
                    <div className="p-2.5 rounded-lg bg-[#0A0A0F] border-l-2 border-[#F5B301] text-[11px] font-handwriting text-[#FFF8E7] text-base leading-tight">
                      “{movie.n}”
                    </div>
                  )}

                  {movie.p.length > 0 && (
                    <div className="text-[11px] text-[#A3A392]">
                      <span className="text-[#737380]">Platforms:</span> {movie.p.join(', ')}
                    </div>
                  )}
                </div>

                {/* Card CTA */}
                <div className="pt-3 mt-3 border-t border-[#20202E] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToWatchlist(movie)}
                    disabled={isSaved}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1C1C28] hover:bg-[#F5B301] text-[#F5F5DC] hover:text-[#0A0A0F] font-poster text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-default"
                  >
                    {isSaved ? <Check size={13} /> : <Plus size={13} />}
                    <span>{isSaved ? 'In Library' : 'Add to Queue'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyTitle(movie.t)}
                    className="p-2 rounded-xl bg-[#1C1C28] hover:bg-[#28283C] text-[#A3A392] hover:text-[#F5F5DC] transition-colors cursor-pointer"
                    title="Copy Title"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 3: GENERAL SHARE DASHBOARD & PASS
  // ==========================================
  const watchlist = movies.filter((m) => m.status === 'watchlist');
  const watched = movies.filter((m) => m.status === 'watched');
  const shareHistory = settings.shareHistory || [];

  const handleCopyWatchlistText = () => {
    const text = `🎬 My Movielist Watchlist:\n${
      watchlist.length > 0
        ? watchlist
            .map(
              (m, i) =>
                `${i + 1}. ${m.title} (${m.contentType}) - ${m.platforms.join(', ')}`
            )
            .join('\n')
        : 'Currently curating new movies to binge!'
    }\n\n🍿 Tracked with Movielist`;

    navigator.clipboard.writeText(text);
    onShowToast?.('Watchlist text copied to clipboard! 📋');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5B301]">
            <Share2 size={14} />
            <span>Recommendations & Cinema Pass</span>
          </div>
          <h1 className="font-poster text-3xl sm:text-4xl text-[#F5F5DC] tracking-wider mt-1">
            SHARE & RECOMMEND
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A392] max-w-xl mt-1">
            Send collectible ticket stubs to friends, export movie recommendation cards as images,
            or share your entire watched collection.
          </p>
        </div>

        <button
          onClick={handleCopyWatchlistText}
          className="ticket-notch-button py-2.5 px-4 bg-[#F5B301] text-[#0A0A0F] font-poster text-sm tracking-wider uppercase inline-flex items-center gap-2 cursor-pointer self-start sm:self-center font-bold"
        >
          <Copy size={16} />
          <span>Copy Watchlist Text</span>
        </button>
      </div>

      <FilmStripDivider label="YOUR CINEMA PASS & DISPATCH" />

      {movies.length === 0 ? (
        <CinematicEmptyState
          type="share"
          onAction={() => onOpenAddModal?.()}
        />
      ) : (
        /* Cinematic Pass Card */
        <div className="max-w-2xl mx-auto bg-[#14141C] border border-[#262638] rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="bg-[#1C1C28] p-5 border-b border-[#28283C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
              <FilmReelIcon size={24} />
            </div>
            <div>
              <div className="font-poster text-xl tracking-wider text-[#F5F5DC]">
                MOVIELIST CINEMA PASS
              </div>
              <div className="text-[11px] text-[#A3A392]">
                CURATED BY {settings.userName?.toUpperCase() || 'CINEPHILE'} · OFFICIAL QUEUE
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-[#F5B301]">№ {Date.now().toString().slice(-6)}</div>
            <div className="text-[10px] text-[#737380]">VERIFIED CURATION</div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#A3A392] border-b border-[#20202E] pb-3">
            <span>
              Watchlist: <strong className="text-[#F5F5DC] font-mono">{watchlist.length}</strong>{' '}
              titles
            </span>
            <span>
              Watched: <strong className="text-[#F5F5DC] font-mono">{watched.length}</strong>{' '}
              titles
            </span>
            <span>
              Theme: <strong className="text-[#F5B301]">Dark Theatre</strong>
            </span>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#F5B301]">
              Featured in Queue:
            </div>
            {watchlist.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#737380] italic">
                Add titles to your watchlist to feature them on this cinema pass.
              </div>
            ) : (
              <div className="space-y-2">
                {watchlist.slice(0, 5).map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-lg bg-[#0E0E14] border border-[#20202E] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#F5B301] w-4">{idx + 1}.</span>
                      <span className="font-medium text-[#F5F5DC]">{m.title}</span>
                      {m.originalTitle && (
                        <span className="text-[#737380] font-telugu text-[11px]">
                          ({m.originalTitle})
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#737380]">{m.platforms[0] || 'Theatre'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="relative h-6 bg-[#0E0E14] flex items-center justify-between px-2 border-y border-dashed border-[#28283C]">
          <div className="w-5 h-5 -ml-4 rounded-full bg-[#0A0A0F]" />
          <div className="text-[10px] font-mono text-[#555566] tracking-widest uppercase">
            TEAR ALONG DOTTED LINE TO SHARE
          </div>
          <div className="w-5 h-5 -mr-4 rounded-full bg-[#0A0A0F]" />
        </div>

        <div className="p-4 bg-[#101018] flex items-center justify-between">
          <div className="text-[11px] text-[#737380]">
            Pro tip: Click "Share" on any movie card or detail drawer to export ticket stub PNGs!
          </div>
          <button
            onClick={handleCopyWatchlistText}
            className="text-xs text-[#F5B301] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Copy size={13} />
            <span>Copy Text</span>
          </button>
        </div>
      </div>
      )}

      {/* SHARE HISTORY SECTION */}
      {shareHistory.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A3A392]">
              <History size={14} className="text-[#F5B301]" />
              <span>Recent Share History</span>
            </div>
            <button
              onClick={() => {
                clearShareHistory();
                onShowToast?.('Share history cleared');
              }}
              className="text-[11px] text-[#737380] hover:text-[#FF6B6B] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 size={12} />
              <span>Clear History</span>
            </button>
          </div>

          <div className="bg-[#14141C] border border-[#242436] rounded-xl overflow-hidden divide-y divide-[#1E1E2C]">
            {shareHistory.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="p-3 flex items-center justify-between text-xs text-[#A3A392]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#0A0A0F] border border-[#2E2E44] flex items-center justify-center text-[#F5B301]">
                    <Ticket size={12} />
                  </div>
                  <div>
                    <span className="text-[#F5F5DC] font-medium">{item.movieTitle}</span>
                    <span className="text-[10px] text-[#737380] ml-2">
                      ({item.type === 'collection' ? `${item.itemCount || 'Collection'} movies` : 'Single Ticket'})
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#737380]">
                  {new Date(item.sharedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
