import React, { useRef, useState, useEffect } from 'react';
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
  Ticket,
  Loader2,
  Film,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Movie, CONTENT_TYPE_LABELS } from '../../types/movie';
import { FilmReelIcon } from '../common/CinematicIcons';
import { useMovieStore } from '../../store/useMovieStore';
import { encodeMovieShareData, formatMovieShareText } from '../../services/shareService';

interface ShareMovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}

/**
 * Robust 2D HTML5 Canvas Fallback Generator:
 * Used if html2canvas ever encounters errors or is blocked by an environment.
 */
function generateFallbackTicketDownload(movie: Movie, sharerName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D Canvas context unavailable');

      // 1. Dark vintage background
      ctx.fillStyle = '#0E0E17';
      ctx.fillRect(0, 0, 1200, 720);

      // 2. Gold Outer Border
      ctx.strokeStyle = '#F5B301';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, 1140, 660);

      // 3. Inner Dashed Border
      ctx.strokeStyle = '#383852';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(50, 50, 1100, 620);
      ctx.setLineDash([]);

      // 4. Header Band
      ctx.fillStyle = '#1C1C2C';
      ctx.fillRect(52, 52, 1096, 64);
      ctx.fillStyle = '#F5B301';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`CINEMA ADMIT ONE · ${movie.contentType.toUpperCase()}`, 80, 93);
      ctx.fillStyle = '#8E8EA0';
      ctx.font = '18px monospace';
      ctx.fillText(`№ ${movie.id.slice(0, 6).toUpperCase()}`, 1020, 93);

      // 5. Left Poster Area: Title Plaque
      ctx.fillStyle = '#16141F';
      ctx.fillRect(80, 150, 260, 390);
      ctx.strokeStyle = '#F5B301';
      ctx.lineWidth = 3;
      ctx.strokeRect(80, 150, 260, 390);

      ctx.fillStyle = '#F5B301';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ OFFICIAL TITLE ★', 210, 185);

      ctx.fillStyle = '#F5F5DC';
      ctx.font = 'bold 28px "Cinzel", Georgia, serif';
      const words = movie.title.toUpperCase().split(' ');
      let line = '';
      let curY = 280;
      for (const w of words) {
        const testLine = line ? `${line} ${w}` : w;
        if (ctx.measureText(testLine).width > 230 && line) {
          ctx.fillText(line, 210, curY);
          line = w;
          curY += 34;
        } else {
          line = testLine;
        }
      }
      if (line) ctx.fillText(line, 210, curY);

      const yearStr = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';
      ctx.fillStyle = '#F5B301';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`[ ${movie.contentType.toUpperCase()} · ${yearStr || 'PREMIERE'} ]`, 210, 505);

      // 6. Right Details Area
      ctx.textAlign = 'left';
      ctx.fillStyle = '#F5F5DC';
      ctx.font = 'bold 44px "Cinzel", Georgia, serif';
      ctx.fillText(movie.title.toUpperCase(), 380, 205);

      if (movie.originalTitle && movie.originalTitle !== movie.title) {
        ctx.fillStyle = '#A3A392';
        ctx.font = 'italic 22px sans-serif';
        ctx.fillText(movie.originalTitle, 380, 245);
      }

      if (movie.rating) {
        ctx.fillStyle = '#F5B301';
        ctx.font = 'bold 30px "Cinzel", Georgia, serif';
        ctx.fillText(`★ RATING: ${movie.rating} / 10`, 380, 305);
      }

      ctx.fillStyle = '#A3A392';
      ctx.font = '20px sans-serif';
      ctx.fillText(`Genres: ${movie.genres.slice(0, 3).join(', ')}`, 380, 355);
      if (movie.platforms.length > 0) {
        ctx.fillStyle = '#F5B301';
        ctx.fillText(`Available On: ${movie.platforms.slice(0, 3).join(', ')}`, 380, 395);
      }

      const note = movie.shareCaption || movie.notes;
      if (note) {
        ctx.fillStyle = '#FFF8E7';
        ctx.font = 'italic 24px serif';
        const displayNote = `"${note.slice(0, 65)}${note.length > 65 ? '...' : ''}"`;
        ctx.fillText(displayNote, 380, 460);
      }

      // 7. Perforated Line
      ctx.strokeStyle = '#383852';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(60, 575);
      ctx.lineTo(1140, 575);
      ctx.stroke();
      ctx.setLineDash([]);

      // 8. Footer
      ctx.fillStyle = '#737380';
      ctx.font = '16px monospace';
      ctx.fillText('CURATED DISPATCH', 80, 620);
      ctx.fillStyle = '#F5F5DC';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`Recommended by ${sharerName}`, 80, 650);

      ctx.fillStyle = '#F5B301';
      ctx.font = 'bold 30px "Cinzel", Georgia, serif';
      ctx.textAlign = 'right';
      ctx.fillText('MOVIELIST CINEMA', 1120, 650);

      // Export Blob
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas blob generation failed'));
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanTitle = movie.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        a.download = `movielist-ticket-${cleanTitle}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        resolve();
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
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

  // Keyboard shortcut listener to close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

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

  // 3. Download Ticket as PNG (Reliable across all web and mobile browsers)
  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    setIsGeneratingImage(true);

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Generate canvas without CORS taint since poster is pure SVG/CSS typography
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0A0A0F',
        scale: Math.max(window.devicePixelRatio || 2, 2),
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png', 1.0)
      );

      if (!blob) {
        throw new Error('Canvas blob generation failed');
      }

      const cleanTitle = movie.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      const fileName = `movielist-ticket-${cleanTitle}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Check mobile Web Share API for native image sharing/saving
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        /mobile|android|iphone|ipad/i.test(navigator.userAgent)
      ) {
        try {
          await navigator.share({
            files: [file],
            title: `Movie Pass: ${movie.title}`,
            text: `Admit One pass for ${movie.title} on Movielist!`,
          });
          addShareHistory({
            movieId: movie.id,
            movieTitle: movie.title,
            type: 'single',
          });
          onShowToast?.('Ticket shared / saved! 🎟️');
          setIsGeneratingImage(false);
          return;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            setIsGeneratingImage(false);
            return;
          }
        }
      }

      // Standard browser download via Object URL
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      addShareHistory({
        movieId: movie.id,
        movieTitle: movie.title,
        type: 'single',
      });
      onShowToast?.('Ticket stub PNG downloaded! 🎟️');
    } catch (err) {
      console.warn('html2canvas failed, attempting fallback 2D canvas export:', err);
      try {
        await generateFallbackTicketDownload(movie, sharerName);
        addShareHistory({
          movieId: movie.id,
          movieTitle: movie.title,
          type: 'single',
        });
        onShowToast?.('Ticket stub PNG downloaded! 🎟️');
      } catch (fallbackErr) {
        console.error('All download methods failed:', fallbackErr);
        onShowToast?.('Download failed. You can copy the share link or text!');
      }
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

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onShowToast?.('Opening WhatsApp share...');
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[70] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-[#14141C] border border-[#28283C] rounded-2xl shadow-2xl overflow-hidden z-[75] my-auto flex flex-col max-h-[92vh]"
        >
          {/* STICKY HEADER WITH HIGH-CONTRAST CLOSE BUTTON */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-6 py-4 bg-[#12121A]/98 backdrop-blur-md border-b border-[#28283C] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/50 flex items-center justify-center text-[#F5B301] shrink-0">
                <Share2 size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="font-poster text-lg sm:text-xl tracking-wider text-[#F5F5DC] truncate">
                  SHARE RECOMMENDATION PASS
                </h3>
                <p className="text-[11px] text-[#A3A392] truncate">
                  Send a collectible vintage ticket stub to friends
                </p>
              </div>
            </div>

            {/* High-visibility Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-[#222232] hover:bg-[#C41E3A] border border-[#3E3E56] hover:border-[#FF5A6E] text-[#F5F5DC] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 group shrink-0 ml-3"
              aria-label="Close Share Pass"
              title="Close Share Pass (Esc)"
            >
              <X size={18} className="text-[#F5B301] group-hover:text-white stroke-[2.5]" />
              <span className="font-mono text-xs uppercase font-bold tracking-wider">Close</span>
            </button>
          </div>

          {/* SCROLLABLE MODAL CONTENT BODY */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
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
                <div className="bg-[#1C1C2C] px-4 sm:px-5 py-3 border-b border-[#2E2E44] flex items-center justify-between">
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
                <div className="p-4 sm:p-5 relative">
                  {/* Subtle Movielist Logo Watermark */}
                  <div className="absolute right-3 bottom-14 opacity-5 select-none pointer-events-none text-[#F5B301]">
                    <FilmReelIcon size={180} />
                  </div>

                  <div className="flex gap-3 sm:gap-4 relative z-10">
                    {/* MOVIE POSTER: Displays Movie Name prominently for crystal-clear visibility on all screens */}
                    <div className="w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-b from-[#1C180E] via-[#0E0E17] to-[#161208] border-2 border-[#F5B301]/70 shrink-0 shadow-lg flex flex-col justify-between p-2.5 relative select-none">
                      {/* Top Poster Badge */}
                      <div className="flex items-center justify-between border-b border-[#F5B301]/30 pb-1">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F5B301]" />
                          <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-[#F5B301] font-bold">
                            TITLE
                          </span>
                        </div>
                        <span className="font-mono text-[8px] text-[#A3A392]">
                          {releaseYear || movie.contentType.toUpperCase()}
                        </span>
                      </div>

                      {/* Center: Movie Name in Bold, High-Contrast Cinematic Poster Typography */}
                      <div className="my-auto py-1 text-center flex flex-col items-center justify-center">
                        <div
                          className="w-full font-poster uppercase tracking-wider text-[#F5F5DC] drop-shadow-[0_2px_8px_rgba(245,179,1,0.3)] leading-tight text-center break-words px-1"
                          style={{
                            fontSize:
                              movie.title.length <= 12
                                ? '1.15rem'
                                : movie.title.length <= 22
                                ? '0.95rem'
                                : movie.title.length <= 35
                                ? '0.8rem'
                                : '0.72rem',
                          }}
                        >
                          {movie.title}
                        </div>

                        {movie.originalTitle && movie.originalTitle !== movie.title && (
                          <div className="text-[10px] text-[#F5B301]/80 font-telugu italic truncate max-w-full mt-1 px-1">
                            {movie.originalTitle}
                          </div>
                        )}
                      </div>

                      {/* Bottom Poster Label */}
                      <div className="border-t border-[#F5B301]/30 pt-1 text-center">
                        <div className="font-mono text-[7px] sm:text-[8px] uppercase tracking-widest text-[#F5B301] font-semibold truncate">
                          ★ {CONTENT_TYPE_LABELS[movie.contentType]} ★
                        </div>
                      </div>
                    </div>

                    {/* Movie Info Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className="font-poster text-xl sm:text-2xl text-[#F5F5DC] tracking-wide leading-tight">
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
                      <div className="text-[11px] text-[#A3A392] space-y-0.5 pt-0.5">
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
                    <div className="mt-4 p-3 rounded-xl bg-[#0F0F18] border-l-4 border-[#F5B301] shadow-inner relative">
                      <div className="text-[10px] uppercase font-mono tracking-widest text-[#F5B301] mb-1">
                        PERSONAL REVIEW & NOTE:
                      </div>
                      <div className="font-handwriting text-lg sm:text-2xl text-[#FFF8E7] leading-relaxed tracking-wide">
                        “{movie.shareCaption || movie.notes}”
                      </div>
                    </div>
                  )}

                  {/* Perforated Tear Line with Semicircles */}
                  <div className="relative my-4 flex items-center justify-between">
                    <div className="w-5 h-5 -ml-6 sm:-ml-7 rounded-full bg-[#14141C] border-r border-[#383852]" />
                    <div className="flex-1 border-t-2 border-dashed border-[#2E2E44] mx-2" />
                    <div className="w-5 h-5 -mr-6 sm:-mr-7 rounded-full bg-[#14141C] border-l border-[#383852]" />
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
                  className="p-3.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#38BDF8]/50 text-left transition-all cursor-pointer group flex items-start gap-3 disabled:opacity-60"
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

          {/* STICKY BOTTOM BAR WITH PROMINENT CLOSE / DISMISS BUTTON */}
          <div className="sticky bottom-0 z-30 p-3 sm:px-6 bg-[#12121A]/98 backdrop-blur-md border-t border-[#28283C] shrink-0 flex items-center justify-between gap-3">
            <div className="text-[11px] text-[#737380] hidden sm:block font-mono">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#1C1C28] border border-[#38384E] text-[#F5F5DC]">ESC</kbd> or click outside to dismiss
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1C1C28] hover:bg-[#28283C] border border-[#38384E] hover:border-[#F5B301] text-[#F5F5DC] font-poster text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg ml-auto"
            >
              <X size={16} className="text-[#F5B301] stroke-[2.5]" />
              <span>Close Share Pass</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
