import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Check,
  Copy,
  Link,
  MessageCircle,
  Download,
  Film,
  Star,
  CheckSquare,
  Square,
  Sparkles,
  Ticket,
  Calendar,
  Loader2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Movie, CONTENT_TYPE_LABELS } from '../../types/movie';
import { useMovieStore } from '../../store/useMovieStore';
import { FilmReelIcon, TicketIcon } from '../common/CinematicIcons';
import { TicketButton } from '../common/TicketButton';
import {
  encodeCollectionShareData,
} from '../../services/shareService';
import { CinematicPosterFallback } from '../common/CinematicPosterFallback';

interface ShareCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchedMovies: Movie[];
  onShowToast?: (message: string) => void;
}

export const ShareCollectionModal: React.FC<ShareCollectionModalProps> = ({
  isOpen,
  onClose,
  watchedMovies,
  onShowToast,
}) => {
  const { settings, addShareHistory } = useMovieStore();
  const collectionRef = useRef<HTMLDivElement>(null);

  // Initialize selected movies with all watched movies by default (or top 10)
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    watchedMovies.slice(0, 10).map((m) => m.id)
  );

  const [collectionTitle, setCollectionTitle] = useState(
    `${settings.userName || 'Teja'}'s Must-Watch Movie Recommendations`
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (!isOpen) return null;

  const curatorName = settings.userName || 'A Cinephile';
  const selectedMovies = watchedMovies.filter((m) => selectedIds.includes(m.id));

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === watchedMovies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(watchedMovies.map((m) => m.id));
    }
  };

  // Generate shareable link
  const encodedData = encodeCollectionShareData(
    selectedMovies,
    curatorName,
    collectionTitle
  );
  const shareableUrl = `${window.location.origin}/share?collection=${encodeURIComponent(
    encodedData
  )}`;

  // Formatted collection text
  const shareText = `🎬 ${collectionTitle.toUpperCase()}\nCurated by ${curatorName} · ${selectedMovies.length} recommendations\n\n${selectedMovies
    .map(
      (m, idx) =>
        `${idx + 1}. ${m.title}${m.rating ? ` — ⭐ ${m.rating}/10` : ''}${
          m.platforms.length > 0 ? ` (${m.platforms.join(', ')})` : ''
        }${m.shareCaption || m.notes ? `\n   "${m.shareCaption || m.notes}"` : ''}`
    )
    .join('\n\n')}\n\n🍿 View full collection & posters: ${shareableUrl}\nTracked with Movielist`;

  // Copy Link
  const handleCopyLink = () => {
    if (selectedMovies.length === 0) {
      onShowToast?.('Please select at least 1 movie to share');
      return;
    }
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    addShareHistory({
      movieTitle: collectionTitle,
      type: 'collection',
      itemCount: selectedMovies.length,
    });
    onShowToast?.('Collection link copied to clipboard! 🔗');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Copy Text
  const handleCopyText = () => {
    if (selectedMovies.length === 0) {
      onShowToast?.('Please select at least 1 movie to share');
      return;
    }
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    addShareHistory({
      movieTitle: collectionTitle,
      type: 'collection',
      itemCount: selectedMovies.length,
    });
    onShowToast?.('Collection recommendations text copied! 📋');
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Download Collection Image
  const handleDownloadImage = async () => {
    if (!collectionRef.current || selectedMovies.length === 0) return;
    setIsGeneratingImage(true);

    try {
      const canvas = await html2canvas(collectionRef.current, {
        backgroundColor: '#0A0A0F',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = image;
      downloadLink.download = `movielist-collection-${curatorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      addShareHistory({
        movieTitle: collectionTitle,
        type: 'collection',
        itemCount: selectedMovies.length,
      });
      onShowToast?.('Collection recommendation PNG downloaded! 🎟️');
    } catch (err) {
      console.error('Error generating image:', err);
      onShowToast?.('Failed to render image, please copy link or text');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Share to WhatsApp
  const handleShareToWhatsApp = () => {
    if (selectedMovies.length === 0) {
      onShowToast?.('Please select at least 1 movie to share');
      return;
    }
    addShareHistory({
      movieTitle: collectionTitle,
      type: 'collection',
      itemCount: selectedMovies.length,
    });

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
          className="relative w-full max-w-3xl bg-[#14141C] border border-[#28283C] rounded-2xl shadow-2xl overflow-hidden z-10 my-6 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#101018] border-b border-[#20202E] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
                <Share2 size={16} />
              </div>
              <div>
                <h3 className="font-poster text-xl tracking-wider text-[#F5F5DC]">
                  SHARE MY WATCHED COLLECTION
                </h3>
                <p className="text-[11px] text-[#A3A392]">
                  Curate and recommend multiple titles to friends or film clubs
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="text-[#737380] hover:text-[#F5F5DC] p-1.5 rounded-lg hover:bg-[#1C1C28] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body: Scrollable */}
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
            {/* Collection Title Config */}
            <div className="bg-[#181824] p-4 rounded-xl border border-[#262638] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#F5B301]">
                  Collection Title & Header
                </label>
                <span className="text-[11px] text-[#737380]">
                  Curated by: <strong className="text-[#F5F5DC]">{curatorName}</strong>
                </span>
              </div>
              <input
                type="text"
                value={collectionTitle}
                onChange={(e) => setCollectionTitle(e.target.value)}
                placeholder="e.g. Teja's Top 10 Telugu & Sci-Fi Masterpieces"
                className="w-full bg-[#0A0A0F] border border-[#303046] rounded-xl px-3.5 py-2 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#F5B301] transition-colors font-medium"
              />
            </div>

            {/* Movie Selection Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#A3A392] flex items-center gap-2">
                  <span>Select Movies to Include</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F5B301]/20 text-[#F5B301] font-mono text-[11px] font-bold">
                    {selectedIds.length} of {watchedMovies.length} selected
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-[#F5B301] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {selectedIds.length === watchedMovies.length ? (
                    <>
                      <CheckSquare size={13} />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square size={13} />
                      <span>Select All</span>
                    </>
                  )}
                </button>
              </div>

              {watchedMovies.length === 0 ? (
                <div className="p-8 text-center bg-[#0E0E14] rounded-xl border border-[#20202E] text-xs text-[#737380]">
                  No watched movies logged yet. Mark some movies as watched first!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {watchedMovies.map((movie) => {
                    const isSelected = selectedIds.includes(movie.id);
                    return (
                      <div
                        key={movie.id}
                        onClick={() => handleToggleSelect(movie.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1E1E2C] border-[#F5B301]/60 shadow-sm'
                            : 'bg-[#101018] border-[#222232] opacity-70 hover:opacity-100 hover:border-[#333348]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-[#F5B301] border-[#F5B301] text-[#0A0A0F]'
                                : 'bg-[#0A0A0F] border-[#383852]'
                            }`}
                          >
                            {isSelected && <Check size={13} className="stroke-[3]" />}
                          </div>

                          {/* Mini poster thumbnail */}
                          <div className="w-8 h-11 rounded bg-[#0A0A0F] shrink-0 overflow-hidden border border-[#28283C]">
                            {movie.posterUrl ? (
                              <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-poster text-[#737380]">
                                {movie.title.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-poster text-sm text-[#F5F5DC] truncate tracking-wide">
                              {movie.title}
                            </div>
                            <div className="text-[10px] text-[#A3A392] truncate flex items-center gap-1.5">
                              <span>{CONTENT_TYPE_LABELS[movie.contentType]}</span>
                              {movie.rating && (
                                <span className="text-[#F5B301] font-mono">
                                  ⭐ {movie.rating}/10
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {movie.platforms[0] && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A0A0F] border border-[#262638] text-[#8E8EA0] shrink-0">
                            {movie.platforms[0]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PREVIEW OF THE COLLECTION TICKET GRID (Exportable via html2canvas) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#A3A392] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#F5B301]" />
                <span>Collection Preview Card</span>
              </div>

              <div className="flex justify-center">
                <div
                  ref={collectionRef}
                  className="w-full bg-[#161622] border-2 border-[#383852] rounded-2xl overflow-hidden shadow-2xl p-5 text-[#F5F5DC] space-y-4"
                  style={{
                    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.8), 0 0 15px rgba(245,179,1,0.08)',
                  }}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-[#2C2C40] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
                        <FilmReelIcon size={18} />
                      </div>
                      <div>
                        <h4 className="font-poster text-xl tracking-wider text-[#F5F5DC]">
                          {collectionTitle}
                        </h4>
                        <div className="text-[11px] text-[#A3A392]">
                          Curated by <strong className="text-[#F5B301]">{curatorName}</strong> ·{' '}
                          {selectedMovies.length} Recommended Masterpieces
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px] text-[#737380] uppercase">
                      MOVIELIST PASS
                    </div>
                  </div>

                  {/* Grid of Movie Cards */}
                  {selectedMovies.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#737380] italic">
                      Select movies above to build your recommendation preview
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedMovies.slice(0, 6).map((m, idx) => (
                        <div
                          key={m.id}
                          className="bg-[#0E0E16] border border-[#28283C] rounded-xl p-2.5 space-y-1.5 shadow-sm"
                        >
                          <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-[#0A0A0F] border border-[#222232] relative">
                            {m.posterUrl ? (
                              <img
                                src={m.posterUrl}
                                alt={m.title}
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <CinematicPosterFallback
                                title={m.title}
                                originalTitle={m.originalTitle}
                                contentType={m.contentType}
                                genres={m.genres}
                                releaseDate={m.releaseDate}
                                platforms={m.platforms}
                                aspect="portrait"
                                showBillingBlock={false}
                              />
                            )}
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#0A0A0F]/85 font-mono text-[9px] text-[#F5B301]">
                              #{idx + 1}
                            </div>
                            {m.rating && (
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#0A0A0F]/85 font-mono text-[9px] text-[#F5B301] flex items-center gap-0.5 font-bold">
                                <Star size={8} className="fill-[#F5B301]" />
                                {m.rating}
                              </div>
                            )}
                          </div>
                          <div className="font-poster text-xs text-[#F5F5DC] truncate tracking-wide">
                            {m.title}
                          </div>
                          {m.platforms.length > 0 && (
                            <div className="text-[10px] text-[#A3A392] truncate">
                              {m.platforms.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedMovies.length > 6 && (
                    <div className="text-center text-xs text-[#F5B301] font-mono">
                      + {selectedMovies.length - 6} more titles included in shareable link
                    </div>
                  )}

                  {/* Ticket Footer */}
                  <div className="pt-3 border-t border-dashed border-[#2C2C40] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#737380]">
                      Open in Movielist to add to your weekend queue
                    </span>
                    <div className="flex items-center gap-1 font-poster text-sm text-[#F5B301] tracking-wider">
                      <FilmReelIcon size={14} />
                      <span>MOVIELIST</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sharing Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-3 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#F5B301]/50 text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301] shrink-0">
                  {copiedLink ? <Check size={16} /> : <Link size={16} />}
                </div>
                <div>
                  <div className="font-poster text-sm text-[#F5F5DC] tracking-wide">
                    {copiedLink ? 'LINK COPIED!' : 'COPY COLLECTION LINK'}
                  </div>
                  <div className="text-[10px] text-[#A3A392]">
                    Shareable /share?collection=... URL
                  </div>
                </div>
              </button>

              {/* Download PNG */}
              <button
                type="button"
                disabled={isGeneratingImage || selectedMovies.length === 0}
                onClick={handleDownloadImage}
                className="p-3 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#38BDF8]/50 text-left transition-all cursor-pointer flex items-center gap-3 disabled:opacity-60"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0A0A0F] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shrink-0">
                  {isGeneratingImage ? (
                    <Loader2 size={16} className="animate-spin text-[#38BDF8]" />
                  ) : (
                    <Download size={16} />
                  )}
                </div>
                <div>
                  <div className="font-poster text-sm text-[#F5F5DC] tracking-wide">
                    {isGeneratingImage ? 'GENERATING IMAGE...' : 'DOWNLOAD AS IMAGE'}
                  </div>
                  <div className="text-[10px] text-[#A3A392]">
                    High-res PNG of your recommendations card
                  </div>
                </div>
              </button>

              {/* Share to WhatsApp */}
              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="p-3 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#25D366]/50 text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0A0A0F] border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <div className="font-poster text-sm text-[#F5F5DC] tracking-wide">
                    SHARE TO WHATSAPP
                  </div>
                  <div className="text-[10px] text-[#A3A392]">
                    Send formatted list directly to group chats
                  </div>
                </div>
              </button>

              {/* Copy Formatted Text */}
              <button
                type="button"
                onClick={handleCopyText}
                className="p-3 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#F5B301]/50 text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301] shrink-0">
                  {copiedText ? <Check size={16} /> : <Copy size={16} />}
                </div>
                <div>
                  <div className="font-poster text-sm text-[#F5F5DC] tracking-wide">
                    {copiedText ? 'TEXT COPIED!' : 'COPY FORMATTED TEXT'}
                  </div>
                  <div className="text-[10px] text-[#A3A392]">
                    Full numbered list formatted for clipboard
                  </div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
