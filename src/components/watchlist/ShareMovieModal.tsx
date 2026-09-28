import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Share2,
  Star,
  Download,
  MessageCircle,
  Link,
  Sparkles,
  Film,
  Ticket,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Movie, CONTENT_TYPE_LABELS } from '../../types/movie';
import { FilmReelIcon, TicketIcon } from '../common/CinematicIcons';
import { TicketButton } from '../common/TicketButton';
import { useMovieStore } from '../../store/useMovieStore';
import { encodeMovieShareData, formatMovieShareText } from '../../services/shareService';
import { CinematicPosterFallback } from '../common/CinematicPosterFallback';

interface ShareMovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}

export const ShareMovieModal: React.FC<ShareMovieModalProps> = ({
  movie,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { settings, addShareHistory } = useMovieStore();
  const ticketRef = useRef<HTMLDivElement>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (!isOpen || !movie) return null;

  const isWatched = movie.status === 'watched';
  const sharerName = settings.userName || 'A Cinephile';
  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : undefined;

  // Generate shareable URL with encoded movie data
  const encodedData = encodeMovieShareData(movie, sharerName);
  const origin = window.location.origin;
  const shareableUrl = `${origin}/share?data=${encodeURIComponent(encodedData)}`;

  // Formatted text
  const shareText = `${formatMovieShareText(movie, sharerName)}\n${shareableUrl}`;

  // 1. Copy Link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    addShareHistory({
      movieId: movie.id,
      movieTitle: movie.title,
      type: 'single',
    });
    onShowToast?.('Share link copied to clipboard! 🔗');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 2. Copy Text handler
  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    addShareHistory({
      movieId: movie.id,
      movieTitle: movie.title,
      type: 'single',
    });
    onShowToast?.('Recommendation text copied! 📋');
    setTimeout(() => setCopiedText(false), 2500);
  };

  // 3. Download Ticket as PNG using html2canvas
  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    setIsGeneratingImage(true);

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0A0A0F',
        scale: 2, // High resolution for crisp preview
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = image;
      downloadLink.download = `movielist-ticket-${movie.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      addShareHistory({
        movieId: movie.id,
        movieTitle: movie.title,
        type: 'single',
      });
      onShowToast?.('Ticket stub PNG downloaded! 🎟️');
    } catch (err) {
      console.error('Error generating image:', err);
      onShowToast?.('Failed to generate image, please try copying text');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 4. Share to WhatsApp / Native Share
  const handleShareToWhatsApp = async () => {
    addShareHistory({
      movieId: movie.id,
      movieTitle: movie.title,
      type: 'single',
    });

    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: `Recommend: ${movie.title}`,
          text: formatMovieShareText(movie, sharerName),
          url: shareableUrl,
        });
        return;
      } catch {
        // Fall back to whatsapp link
      }
    }

    // Direct WhatsApp web/app link
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onShowToast?.('Opening WhatsApp share...');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
        {/* Click outside to close */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-[#14141C] border border-[#28283C] rounded-2xl shadow-2xl overflow-hidden z-10 my-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#101018] border-b border-[#20202E]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
                <Share2 size={16} />
              </div>
              <div>
                <h3 className="font-poster text-xl tracking-wider text-[#F5F5DC]">
                  SHARE RECOMMENDATION PASS
                </h3>
                <p className="text-[11px] text-[#A3A392]">
                  Send a collectible vintage ticket stub to friends
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="text-[#737380] hover:text-[#F5F5DC] p-1.5 rounded-lg hover:bg-[#1C1C28] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* TICKET STUB PREVIEW CARD (Renders to image) */}
            <div className="flex justify-center">
              <div
                ref={ticketRef}
                className="w-full max-w-md bg-[#161622] border-2 border-[#383852] rounded-2xl overflow-hidden shadow-2xl relative text-[#F5F5DC]"
                style={{
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.8), 0 0 15px rgba(245,179,1,0.08)',
                }}
              >
                {/* Vintage Top Header Band */}
                <div className="bg-[#1C1C2C] px-5 py-3 border-b border-[#2E2E44] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C41E3A] animate-pulse" />
                    <span className="font-mono text-[10px] tracking-widest text-[#F5B301] uppercase font-bold">
                      CINEMA ADMIT ONE · {CONTENT_TYPE_LABELS[movie.contentType]}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-[#8E8EA0] uppercase">
                    № {movie.id.slice(0, 6).toUpperCase()}
                  </div>
                </div>

                {/* Main Ticket Body */}
                <div className="p-5 relative">
                  {/* Subtle Movielist Logo Watermark */}
                  <div className="absolute right-3 bottom-14 opacity-5 select-none pointer-events-none text-[#F5B301]">
                    <FilmReelIcon size={180} />
                  </div>

                  <div className="flex gap-4 relative z-10">
                    {/* Poster Thumbnail */}
                    <div className="w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden bg-[#0A0A0F] border border-[#383852] shrink-0 shadow-md">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CinematicPosterFallback
                          title={movie.title}
                          originalTitle={movie.originalTitle}
                          contentType={movie.contentType}
                          genres={movie.genres}
                          releaseDate={movie.releaseDate}
                          platforms={movie.platforms}
                          aspect="portrait"
                          showBillingBlock={false}
                        />
                      )}
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className="font-poster text-2xl sm:text-3xl text-[#F5F5DC] tracking-wide leading-tight line-clamp-2">
                          {movie.title}
                        </h4>
                        {releaseYear && (
                          <div className="text-xs text-[#F5B301] font-mono mt-0.5">
                            Release Year: {releaseYear}
                          </div>
                        )}
                        {movie.originalTitle && movie.originalTitle !== movie.title && (
                          <div className="text-[11px] text-[#A3A392] font-telugu italic truncate mt-0.5">
                            {movie.originalTitle}
                          </div>
                        )}
                      </div>

                      {/* Rating Stars (1-10 or user's rating) */}
                      {movie.rating ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/50">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < Math.round((movie.rating || 0) / 2)
                                    ? 'fill-[#F5B301] text-[#F5B301]'
                                    : 'text-[#3E3E52]'
                                }
                              />
                            ))}
                          </div>
                          <span className="font-poster text-sm text-[#F5B301] font-bold">
                            {movie.rating} / 10
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#8E8EA0] italic">
                          Recommended from Watchlist
                        </div>
                      )}

                      {/* Genres & Platforms */}
                      <div className="text-[11px] text-[#A3A392] space-y-0.5 pt-1">
                        <div>
                          <strong className="text-[#737380]">Genres:</strong>{' '}
                          <span className="text-[#E0E0CE]">{movie.genres.slice(0, 3).join(', ')}</span>
                        </div>
                        {movie.platforms.length > 0 && (
                          <div>
                            <strong className="text-[#737380]">Streaming on:</strong>{' '}
                            <span className="text-[#F5B301]">{movie.platforms.slice(0, 3).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personal Note Styled as Handwritten Quote */}
                  {(movie.shareCaption || movie.notes) && (
                    <div className="mt-4 p-3.5 rounded-xl bg-[#0F0F18] border-l-4 border-[#F5B301] shadow-inner relative">
                      <div className="text-[10px] uppercase font-mono tracking-widest text-[#F5B301] mb-1">
                        PERSONAL REVIEW & NOTE:
                      </div>
                      <div className="font-handwriting text-xl sm:text-2xl text-[#FFF8E7] leading-relaxed tracking-wide">
                        “{movie.shareCaption || movie.notes}”
                      </div>
                    </div>
                  )}

                  {/* Perforated Tear Line with Semicircles */}
                  <div className="relative my-4 flex items-center justify-between">
                    <div className="w-5 h-5 -ml-7 rounded-full bg-[#14141C] border-r border-[#383852]" />
                    <div className="flex-1 border-t-2 border-dashed border-[#2E2E44] mx-2" />
                    <div className="w-5 h-5 -mr-7 rounded-full bg-[#14141C] border-l border-[#383852]" />
                  </div>

                  {/* Footer: "Recommended by [user]" + Movielist Logo Watermark */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
                        <Ticket size={12} />
                      </div>
                      <div>
                        <div className="text-[10px] text-[#737380] uppercase tracking-wider">
                          CURATED DISPATCH
                        </div>
                        <div className="font-medium text-[#F5F5DC] text-[11px]">
                          Recommended by <span className="text-[#F5B301] font-semibold">{sharerName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80">
                      <FilmReelIcon size={14} className="text-[#F5B301]" />
                      <span className="font-poster text-sm text-[#F5F5DC] tracking-wider">
                        MOVIELIST
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 SHARE OPTIONS GRID */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#A3A392] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#F5B301]" />
                <span>Choose How to Share</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A: Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-3.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#F5B301]/50 text-left transition-all cursor-pointer group flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301] shrink-0 group-hover:scale-105 transition-transform">
                    {copiedLink ? <Check size={18} className="text-[#F5B301]" /> : <Link size={18} />}
                  </div>
                  <div>
                    <div className="font-poster text-base text-[#F5F5DC] group-hover:text-[#F5B301] tracking-wide">
                      {copiedLink ? 'LINK COPIED!' : 'COPY SHAREABLE LINK'}
                    </div>
                    <div className="text-[11px] text-[#A3A392] leading-tight">
                      Creates a collectible ticket page at /share?data=...
                    </div>
                  </div>
                </button>

                {/* Option B: Download as Image (PNG) */}
                <button
                  type="button"
                  disabled={isGeneratingImage}
                  onClick={handleDownloadImage}
                  className="p-3.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#F5B301]/50 text-left transition-all cursor-pointer group flex items-start gap-3 disabled:opacity-60"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#0A0A0F] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shrink-0 group-hover:scale-105 transition-transform">
                    {isGeneratingImage ? (
                      <Loader2 size={18} className="animate-spin text-[#38BDF8]" />
                    ) : (
                      <Download size={18} />
                    )}
                  </div>
                  <div>
                    <div className="font-poster text-base text-[#F5F5DC] group-hover:text-[#38BDF8] tracking-wide">
                      {isGeneratingImage ? 'GENERATING PNG...' : 'DOWNLOAD AS IMAGE'}
                    </div>
                    <div className="text-[11px] text-[#A3A392] leading-tight">
                      Export ticket stub PNG to post on stories or group chats
                    </div>
                  </div>
                </button>

                {/* Option C: Share to WhatsApp / Native Share */}
                <button
                  type="button"
                  onClick={handleShareToWhatsApp}
                  className="p-3.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#25D366]/50 text-left transition-all cursor-pointer group flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#0A0A0F] border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <div className="font-poster text-base text-[#F5F5DC] group-hover:text-[#25D366] tracking-wide">
                      SHARE TO WHATSAPP
                    </div>
                    <div className="text-[11px] text-[#A3A392] leading-tight">
                      Send formatted message with link via WhatsApp or Share Sheet
                    </div>
                  </div>
                </button>

                {/* Option D: Copy Text */}
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="p-3.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#F5B301]/50 text-left transition-all cursor-pointer group flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301] shrink-0 group-hover:scale-105 transition-transform">
                    {copiedText ? <Check size={18} className="text-[#F5B301]" /> : <Copy size={18} />}
                  </div>
                  <div>
                    <div className="font-poster text-base text-[#F5F5DC] group-hover:text-[#F5B301] tracking-wide">
                      {copiedText ? 'TEXT COPIED!' : 'COPY FORMATTED TEXT'}
                    </div>
                    <div className="text-[11px] text-[#A3A392] leading-tight">
                      Formatted review message with rating, platforms & quote
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Formatted Text Box preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A3A392]">
                  Formatted Text Preview
                </span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-xs text-[#F5B301] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-3 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-xs text-[#C4C4B5] font-mono whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">
                {shareText}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
