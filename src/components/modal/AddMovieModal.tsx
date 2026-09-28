import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  Youtube,
  Image as ImageIcon,
  Bell,
  MessageSquare,
  AlertCircle,
  ClipboardPaste,
  Check,
  Zap,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  ContentType,
  CONTENT_TYPE_LABELS,
  COMMON_GENRES,
  COMMON_LANGUAGES,
  COMMON_PLATFORMS,
  Movie,
} from '../../types/movie';
import { useMovieStore } from '../../store/useMovieStore';
import { TicketButton } from '../common/TicketButton';
import { ClapperboardIcon, TicketIcon } from '../common/CinematicIcons';
import { PosterPicker } from '../common/PosterPicker';
import { SmartFetchAutocomplete } from '../common/SmartFetchAutocomplete';
import { SmartFetchMovieResult, fetchYouTubeMetadata } from '../../services/smartFetchService';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '../../services/posterService';

import { requestNotificationPermission } from '../../services/notificationService';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  defaultStatus?: 'watchlist' | 'watched';
  movieToEdit?: Movie | null;
}

const CONTENT_TYPES: ContentType[] = [
  'movie',
  'series',
  'anime',
  'shortfilm',
  'shortseries',
];

const QUICK_SOURCES = [
  'YouTube Video',
  'Google Search',
  'Friend Suggestion',
  'Letterboxd',
  'Instagram Reel',
  'Film Festival',
];

export const AddMovieModal: React.FC<AddMovieModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultStatus = 'watchlist',
  movieToEdit,
}) => {
  const { addMovie, updateMovie } = useMovieStore();

  // Form State
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('movie');
  const [genres, setGenres] = useState<string[]>(['Sci-Fi']);
  const [languages, setLanguages] = useState<string[]>(['Telugu']);
  const [platforms, setPlatforms] = useState<string[]>(['Theatre']);
  const [releaseDate, setReleaseDate] = useState('');
  const [notifyOnRelease, setNotifyOnRelease] = useState(true);
  const [isReleased, setIsReleased] = useState(true);
  const [synopsis, setSynopsis] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendedBy, setRecommendedBy] = useState('');
  const [isUpcoming, setIsUpcoming] = useState(false);

  // Smart Fetch feedback state
  const [smartFetchToast, setSmartFetchToast] = useState<{
    movieTitle: string;
    details: string[];
    previousState?: any;
  } | null>(null);

  // Validation errors & Honeypot protection
  const [errors, setErrors] = useState<{ title?: string; contentType?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleSelectSmartFetchResult = (result: SmartFetchMovieResult) => {
    // Preserve previous state for Undo
    const previous = {
      title,
      originalTitle,
      contentType,
      releaseDate,
      genres: [...genres],
      languages: [...languages],
      posterUrl,
      synopsis,
      trailerUrl,
    };

    // Update Title
    setTitle(result.cleanTitle);
    if (result.originalTitle) {
      setOriginalTitle(result.originalTitle);
    }

    // Update Content Type
    if (result.contentType) {
      setContentType(result.contentType);
    }

    const filledFields: string[] = [];

    // Auto-fill Poster
    if (result.posterUrl) {
      setPosterUrl(result.posterUrl);
      filledFields.push('Poster');
    }

    // Auto-fill Release Date
    if (result.releaseDate) {
      setReleaseDate(result.releaseDate);
      filledFields.push(`Release Date (${result.releaseDate})`);
    } else if (result.year) {
      const yearDate = `${result.year}-01-01`;
      setReleaseDate(yearDate);
      filledFields.push(`Year (${result.year})`);
    }

    // Auto-fill Genres
    if (result.genres && result.genres.length > 0) {
      setGenres(result.genres);
      filledFields.push(`Genres (${result.genres.slice(0, 3).join(', ')})`);
    }

    // Auto-fill Languages
    if (result.languages && result.languages.length > 0) {
      setLanguages(result.languages);
    }

    // Auto-fill Synopsis if empty or user had placeholder
    if (result.synopsis && (!synopsis || synopsis === 'No synopsis added yet.')) {
      setSynopsis(result.synopsis);
      filledFields.push('Synopsis');
    }

    // Auto-fill Trailer if available
    if (result.trailerUrl && !trailerUrl) {
      setTrailerUrl(result.trailerUrl);
      filledFields.push('Trailer Preview');
    }

    // Clear title error if any
    setErrors((prev) => ({ ...prev, title: undefined }));

    // Show Smart Fetch confirmation badge
    setSmartFetchToast({
      movieTitle: result.cleanTitle,
      details: filledFields,
      previousState: previous,
    });
  };

  // Screen Wake Lock API: Prevent display sleep while drafting a movie entry
  useEffect(() => {
    let wakeLockSentinel: any = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isOpen) {
        try {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        } catch {
          // Wake lock request failed or not supported in this context
        }
      }
    };

    if (isOpen) {
      requestWakeLock();
    }

    return () => {
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => { });
        wakeLockSentinel = null;
      }
    };
  }, [isOpen]);

  // Pre-fill if movieToEdit is provided
  useEffect(() => {
    if (movieToEdit && isOpen) {
      setTitle(movieToEdit.title);
      setOriginalTitle(movieToEdit.originalTitle || '');
      setContentType(movieToEdit.contentType);
      setGenres(movieToEdit.genres);
      setLanguages(movieToEdit.languages);
      setPlatforms(movieToEdit.platforms);
      setReleaseDate(movieToEdit.releaseDate || '');
      setNotifyOnRelease(movieToEdit.notifyOnRelease ?? true);
      setIsReleased(movieToEdit.isReleased);
      setSynopsis(movieToEdit.synopsis || '');
      setTrailerUrl(movieToEdit.trailerUrl || '');
      setPosterUrl(movieToEdit.posterUrl || '');
      setNotes(movieToEdit.notes || '');
      setRecommendedBy(movieToEdit.recommendedBy || '');
      setErrors({});
    } else if (!movieToEdit && isOpen) {
      setTitle('');
      setOriginalTitle('');
      setContentType('movie');
      setGenres(['Sci-Fi']);
      setLanguages(['Telugu']);
      setPlatforms(['Theatre']);
      setReleaseDate('');
      setNotifyOnRelease(true);
      setIsReleased(true);
      setSynopsis('');
      setTrailerUrl('');
      setPosterUrl('');
      setNotes('');
      setRecommendedBy('');
      setErrors({});
    }
  }, [movieToEdit, isOpen]);

  // Update release status and smart defaults when release date changes
  useEffect(() => {
    if (!releaseDate) {
      setIsUpcoming(false);
      setIsReleased(true);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(releaseDate);

    if (selected > today) {
      setIsUpcoming(true);
      setIsReleased(false);
      setNotifyOnRelease(true);
    } else {
      setIsUpcoming(false);
      setIsReleased(true);
      setNotifyOnRelease(false);
    }
  }, [releaseDate]);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleProcessYouTubeLink = async (url: string) => {
    if (!url) return;
    const ytId = extractYouTubeVideoId(url);
    if (!ytId) return;

    setTrailerUrl(url);

    // Auto-select YouTube in streaming platforms
    setPlatforms((prev) => (prev.includes('YouTube') ? prev : [...prev, 'YouTube']));

    // Fetch rich metadata from YouTube
    const ytData = await fetchYouTubeMetadata(url);

    if (ytData) {
      const previous = {
        title,
        contentType,
        releaseDate,
        genres: [...genres],
        languages: [...languages],
        posterUrl,
      };

      const filledFields: string[] = [];

      // Auto-fill Name (Title)
      if (ytData.cleanTitle && (!title || title.trim().length === 0 || contentType === 'shortfilm')) {
        setTitle(ytData.cleanTitle);
        filledFields.push(`Name (${ytData.cleanTitle})`);
      }

      // Auto-fill Poster
      if (ytData.posterUrl) {
        setPosterUrl(ytData.posterUrl);
        filledFields.push('Poster');
      }

      // Auto-fill Release Date
      if (ytData.releaseDate) {
        setReleaseDate(ytData.releaseDate);
        filledFields.push(`Date (${ytData.releaseDate})`);
      }

      // Auto-fill Genres
      if (ytData.genres && ytData.genres.length > 0) {
        setGenres(ytData.genres);
        filledFields.push(`Genre (${ytData.genres.join(', ')})`);
      }

      // Auto-fill Languages
      if (ytData.languages && ytData.languages.length > 0) {
        setLanguages(ytData.languages);
        filledFields.push(`Language (${ytData.languages.join(', ')})`);
      }

      setErrors((prev) => ({ ...prev, title: undefined }));

      setSmartFetchToast({
        movieTitle: ytData.cleanTitle || 'YouTube Video',
        details: filledFields,
        previousState: previous,
      });
    }
  };

  const handlePasteTrailer = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && extractYouTubeVideoId(text)) {
        await handleProcessYouTubeLink(text);
      } else {
        const manual = prompt('Paste YouTube link here:');
        if (manual && extractYouTubeVideoId(manual)) {
          await handleProcessYouTubeLink(manual);
        }
      }
    } catch {
      const manual = prompt('Paste YouTube link here:');
      if (manual && extractYouTubeVideoId(manual)) {
        await handleProcessYouTubeLink(manual);
      }
    }
  };

  const validate = () => {
    const errs: { title?: string; contentType?: string } = {};
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      errs.title = 'Title is required to create a cinema entry.';
    } else if (trimmedTitle.length > 200) {
      errs.title = 'Title must be under 200 characters.';
    }
    if (!contentType) {
      errs.contentType = 'Please select a content format.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      // Honeypot triggered by bot - reject silently
      onClose();
      return;
    }
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);

    // Request notification permission if saving an upcoming movie with notifications enabled
    if (isUpcoming && notifyOnRelease) {
      requestNotificationPermission().catch(console.error);
    }

    try {
      if (movieToEdit) {
        await updateMovie(movieToEdit.id, {
          title: title.trim(),
          originalTitle: originalTitle.trim() || undefined,
          contentType,
          genres: genres.length > 0 ? genres : ['Cinema'],
          languages: languages.length > 0 ? languages : ['English'],
          platforms: platforms.length > 0 ? platforms : ['Theatre'],
          releaseDate: releaseDate || undefined,
          isReleased,
          notifyOnRelease: isUpcoming ? notifyOnRelease : false,
          synopsis: synopsis.trim() || 'No synopsis added yet.',
          posterUrl: posterUrl.trim() || undefined,
          trailerUrl: trailerUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          recommendedBy: recommendedBy.trim() || undefined,
        });
        onSuccess?.('Movie updated 🎬');
      } else {
        await addMovie({
          title: title.trim(),
          originalTitle: originalTitle.trim() || undefined,
          contentType,
          genres: genres.length > 0 ? genres : ['Cinema'],
          languages: languages.length > 0 ? languages : ['English'],
          platforms: platforms.length > 0 ? platforms : ['Theatre'],
          releaseDate: releaseDate || undefined,
          isReleased,
          notifyOnRelease: isUpcoming ? notifyOnRelease : false,
          synopsis: synopsis.trim() || 'No synopsis added yet.',
          posterUrl: posterUrl.trim() || undefined,
          trailerUrl: trailerUrl.trim() || undefined,
          status: defaultStatus,
          notes: notes.trim() || undefined,
          recommendedBy: recommendedBy.trim() || undefined,
        });
        onSuccess?.('Added to your watchlist 🎬');
      }

      // Reset state
      setTitle('');
      setOriginalTitle('');
      setSynopsis('');
      setNotes('');
      setRecommendedBy('');
      setTrailerUrl('');
      setPosterUrl('');
      setReleaseDate('');
      setErrors({});
      onClose();
    } catch (err) {
      console.error('Error saving movie:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Modal / Slide-up Sheet Container */}
      <div className="relative w-full max-w-3xl bg-[#14141C] border border-[#28283C] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-slide-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#20202E] bg-[#101018] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
              <ClapperboardIcon size={20} />
            </div>
            <div>
              <h2 className="font-poster text-xl tracking-wider text-[#F5F5DC] leading-none">
                {movieToEdit ? 'EDIT CINEMA ENTRY' : 'NEW CINEMA ENTRY'}
              </h2>
              <span className="text-[11px] text-[#A3A392]">
                {movieToEdit
                  ? `Updating details for "${movieToEdit.title}"`
                  : 'Save recommendations so you never forget what to watch'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg bg-[#1C1C28] text-[#737380] hover:text-[#F5F5DC] flex items-center justify-center hover:bg-[#252536] transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* Invisible Honeypot Spam Protection Field */}
          <div className="hidden" aria-hidden="true" tabIndex={-1}>
            <input
              type="text"
              name="website_url_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Section: Title & Original Title */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5B301] mb-1.5">
                Film / Show Title <span className="text-[#C41E3A]">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                  if (extractYouTubeVideoId(val)) {
                    handleProcessYouTubeLink(val);
                  }
                }}
                placeholder="ENTER MOVIE OR SERIES TITLE (e.g. KALKI 2898 AD, DUNE, SEVERANCE)..."
                className={`w-full h-12 px-4 bg-[#0A0A0F] border rounded-xl font-poster text-lg sm:text-xl tracking-wide text-[#F5F5DC] placeholder-[#4e4e60] focus:outline-none transition-colors ${errors.title
                    ? 'border-[#F5B301] ring-1 ring-[#F5B301]/50'
                    : 'border-[#28283C] focus:border-[#F5B301]'
                  }`}
              />
              {errors.title && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#F5B301] font-medium">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{errors.title}</span>
                </div>
              )}

              {/* Smart Fetch Autocomplete & Scraper Helper */}
              <SmartFetchAutocomplete
                titleQuery={title}
                contentType={contentType}
                onSelectResult={handleSelectSmartFetchResult}
              />

              {/* Smart Fetch Auto-filled Confirmation Notification */}
              {smartFetchToast && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#1B180D] border border-[#F5B301]/40 flex items-center justify-between gap-3 text-xs animate-fade-in shadow-md">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#F5B301]/20 flex items-center justify-center shrink-0">
                      <Zap size={14} className="text-[#F5B301] fill-[#F5B301]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#F5B301] truncate">
                        Smart-Fetched "{smartFetchToast.movieTitle}"
                      </div>
                      <div className="text-[#A3A392] text-[11px] truncate">
                        Auto-filled: {smartFetchToast.details.join(' · ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (smartFetchToast.previousState) {
                          const p = smartFetchToast.previousState;
                          setTitle(p.title);
                          setOriginalTitle(p.originalTitle || '');
                          setContentType(p.contentType);
                          setReleaseDate(p.releaseDate);
                          setGenres(p.genres);
                          setLanguages(p.languages);
                          setPosterUrl(p.posterUrl);
                          setSynopsis(p.synopsis);
                          setTrailerUrl(p.trailerUrl);
                        }
                        setSmartFetchToast(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#2A2416] hover:bg-[#38301E] text-[11px] text-[#A3A392] hover:text-white transition-colors cursor-pointer"
                    >
                      Undo
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmartFetchToast(null)}
                      className="p-1 text-[#737380] hover:text-white transition-colors cursor-pointer"
                      aria-label="Dismiss banner"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A3A392] mb-1.5 flex items-center justify-between">
                <span>Original Title</span>
                <span className="text-[11px] text-[#737380]">
                  Telugu script / Regional / Native name
                </span>
              </label>
              <input
                type="text"
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
                placeholder="e.g. కల్కి 2898 ఏ.డీ, 君の名は, Oppenheimer"
                className="w-full h-10 px-3.5 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-sm font-telugu text-[#F5F5DC] placeholder-[#4e4e60] focus:border-[#F5B301] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Section: Content Type Pill Segmented Control */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-2">
              Content Format
            </label>
            <div className="p-1 bg-[#0A0A0F] border border-[#28283C] rounded-2xl grid grid-cols-2 sm:grid-cols-5 gap-1 chip-container-bg">
              {CONTENT_TYPES.map((type, idx) => {
                const active = contentType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      setContentType(type);
                      if (type === 'shortfilm') {
                        setPlatforms((prev) => (prev.includes('YouTube') ? prev : [...prev, 'YouTube']));
                        if (trailerUrl && extractYouTubeVideoId(trailerUrl)) {
                          handleProcessYouTubeLink(trailerUrl);
                        }
                      }
                      if (errors.contentType) setErrors((prev) => ({ ...prev, contentType: undefined }));
                    }}
                    className={`min-h-[2.25rem] py-1 px-1.5 text-[11px] sm:text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center text-center gap-1.5 chip-btn ${
                      idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      active
                        ? 'bg-[#F5B301] text-[#0A0A0F] font-bold shadow-md chip-active'
                        : 'text-[#A3A392] hover:text-[#F5F5DC] hover:bg-[#14141C]'
                    }`}
                  >
                    <span className="leading-tight">{CONTENT_TYPE_LABELS[type]}</span>
                  </button>
                );
              })}
            </div>
            {errors.contentType && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#F5B301] font-medium">
                <AlertCircle size={13} className="shrink-0" />
                <span>{errors.contentType}</span>
              </div>
            )}
          </div>

          {/* Section: Genres Multi-select chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A3A392]">
                Genres ({genres.length} selected)
              </label>
              <span className="text-[11px] text-[#737380]">Tap to toggle</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#0A0A0F]/60 rounded-xl border border-[#20202E] chip-container-bg">
              {COMMON_GENRES.map((genre) => {
                const active = genres.includes(genre);
                return (
                  <button
                    type="button"
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 chip-btn ${active
                        ? 'bg-[#181824] border-[#F5B301] text-[#F5B301] shadow-sm chip-active'
                        : 'bg-[#14141C] border-[#262638] text-[#737380] hover:text-[#A3A392] hover:border-[#38384d]'
                      }`}
                  >
                    {active && <Check size={12} className="stroke-[2.5]" />}
                    <span>{genre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Languages Multi-select chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A3A392]">
                Audio & Languages ({languages.length} selected)
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1 bg-[#0A0A0F]/60 rounded-xl border border-[#20202E] chip-container-bg">
              {COMMON_LANGUAGES.map((lang) => {
                const active = languages.includes(lang);
                return (
                  <button
                    type="button"
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 chip-btn ${active
                        ? 'bg-[#181824] border-[#F5B301] text-[#F5B301] chip-active'
                        : 'bg-[#14141C] border-[#262638] text-[#737380] hover:text-[#A3A392]'
                      }`}
                  >
                    {active && <Check size={12} className="stroke-[2.5]" />}
                    <span>{lang}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Streaming Platforms Multi-select chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A3A392]">
                Streaming Platform / Theatre ({platforms.length} selected)
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1 bg-[#0A0A0F]/60 rounded-xl border border-[#20202E] chip-container-bg">
              {COMMON_PLATFORMS.map((platform) => {
                const active = platforms.includes(platform);
                return (
                  <button
                    type="button"
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 chip-btn ${active
                        ? 'bg-[#181824] border-[#F5B301] text-[#F5B301] chip-active'
                        : 'bg-[#14141C] border-[#262638] text-[#737380] hover:text-[#A3A392]'
                      }`}
                  >
                    {active && <Check size={12} className="stroke-[2.5]" />}
                    <span>{platform}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Release Date & Release Status Dropdown */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column: Release Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-1.5">
                  Release Date
                </label>
                <div className="relative flex items-center">
                  <Calendar
                    size={16}
                    className="absolute left-3 text-[#F5B301] pointer-events-none drop-shadow-[0_0_6px_rgba(245,179,1,0.4)]"
                  />
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-sm text-[#F5F5DC] focus:border-[#F5B301] focus:outline-none transition-colors cursor-pointer"
                  />
                </div>
                <div className="text-[11px] text-[#737380] mt-1">
                  {releaseDate ? (
                    isUpcoming ? (
                      <span className="text-[#F5B301] font-medium">
                        📅 Scheduled premiere date set
                      </span>
                    ) : (
                      <span>Released / Past premiere date</span>
                    )
                  ) : (
                    <span>Optional (leave blank if date unknown)</span>
                  )}
                </div>
              </div>

              {/* Right Column: Release Status Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-1.5">
                  Release Status
                </label>
                <div className="relative flex items-center">
                  {isReleased ? (
                    <CheckCircle2
                      size={16}
                      className="absolute left-3 text-emerald-400 pointer-events-none"
                    />
                  ) : (
                    <Clock
                      size={16}
                      className="absolute left-3 text-[#F5B301] pointer-events-none"
                    />
                  )}
                  <select
                    value={isReleased ? 'released' : 'unreleased'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'released') {
                        setIsReleased(true);
                        setIsUpcoming(false);
                      } else {
                        setIsReleased(false);
                        setIsUpcoming(true);
                        setNotifyOnRelease(true);
                      }
                    }}
                    className="w-full h-10 pl-9 pr-9 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-sm text-[#F5F5DC] focus:border-[#F5B301] focus:outline-none transition-colors cursor-pointer appearance-none"
                  >
                    <option value="released" className="bg-[#14141C] text-[#F5F5DC]">
                      Released
                    </option>
                    <option value="unreleased" className="bg-[#14141C] text-[#F5B301]">
                      Unreleased
                    </option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 text-[#737380] pointer-events-none"
                  />
                </div>
                <div className="text-[11px] text-[#737380] mt-1">
                  {isReleased ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      ✓ Available now (In theatres / OTT)
                    </span>
                  ) : (
                    <span className="text-[#F5B301] font-medium flex items-center gap-1">
                      ⏳ Upcoming / Not yet released
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Smart Notification toggle if unreleased */}
            {!isReleased && (
              <div className="p-3 bg-[#1C1810] border border-[#F5B301]/40 rounded-xl flex items-center justify-between animate-fade-in mt-1 notify-release-banner">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[#F5B301] animate-bounce" />
                  <div>
                    <div className="text-xs font-medium text-[#F5F5DC]">
                      Notify me on release day
                    </div>
                    <div className="text-[10px] text-[#A3A392]">
                      Send alert when available to watch or stream
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyOnRelease}
                    onChange={(e) => setNotifyOnRelease(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0 toggle-track ${
                      notifyOnRelease ? 'bg-[#F5B301]' : 'bg-[#1E1E2A]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${
                        notifyOnRelease ? 'translate-x-[20px]' : 'translate-x-0'
                      }`}
                    >
                      {notifyOnRelease ? (
                        <ChevronLeft size={13} className="text-[#1A1A24] stroke-[2.5]" />
                      ) : (
                        <ChevronRight size={13} className="text-[#1A1A24] stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Section: Synopsis (max 1000 chars, shows counter) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A3A392]">
                Synopsis / Plot Hook
              </label>
              <span
                className={`text-[11px] font-mono ${synopsis.length > 900 ? 'text-[#C41E3A]' : 'text-[#737380]'
                  }`}
              >
                {synopsis.length} / 1000
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={1000}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="What makes this film exciting? What was the premise described in the YouTube review or recommendation?"
              className="w-full p-3 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-sm text-[#F5F5DC] placeholder-[#4e4e60] focus:border-[#F5B301] focus:outline-none transition-colors"
            />
          </div>

          {/* Section: Trailer URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-1.5 flex items-center justify-between">
              <span>Trailer URL (YouTube / Video Link)</span>
              <span className="text-[11px] text-[#F5B301]">
                Watch trailer right inside your watchlist
              </span>
            </label>
            <div className="relative flex items-center">
              <input
                type="url"
                value={trailerUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrailerUrl(val);
                  if (extractYouTubeVideoId(val)) {
                    handleProcessYouTubeLink(val);
                  }
                }}
                placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full h-10 pl-3 pr-24 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-xs text-[#F5F5DC] placeholder-[#4e4e60] focus:border-[#F5B301] focus:outline-none"
              />
              <button
                type="button"
                onClick={handlePasteTrailer}
                className="absolute right-1 px-2.5 py-1 rounded-lg bg-[#1C1C28] hover:bg-[#28283C] border border-[#28283C] text-[11px] text-[#F5B301] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Youtube size={12} className="text-[#FF4444]" />
                <span>Paste Link</span>
              </button>
            </div>
          </div>

          {/* Section: Movie Poster (Pull via link, YouTube thumbnail, Upload from device, or Fetch from Web) */}
          <PosterPicker
            title={title}
            originalTitle={originalTitle}
            contentType={contentType}
            genres={genres}
            releaseDate={releaseDate}
            posterUrl={posterUrl}
            onChangePosterUrl={setPosterUrl}
            trailerUrl={trailerUrl}
            onSelectMetadataResult={handleSelectSmartFetchResult}
          />

          {/* Section: Recommended By (with quick suggestions) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-1.5 flex items-center justify-between">
              <span>Recommended By</span>
              <span className="text-[11px] text-[#F5B301]">
                Never forget where you discovered this!
              </span>
            </label>
            <input
              type="text"
              value={recommendedBy}
              onChange={(e) => setRecommendedBy(e.target.value)}
              placeholder="e.g. YouTube video essay, Friend Rohit, Google search best sci-fi 2024"
              className="w-full h-10 px-3 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-sm text-[#F5F5DC] placeholder-[#4e4e60] focus:border-[#F5B301] focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-[#737380] mr-1">Quick pick:</span>
              {QUICK_SOURCES.map((source) => (
                <button
                  type="button"
                  key={source}
                  onClick={() => setRecommendedBy(source)}
                  className="px-2 py-0.5 rounded bg-[#1C1C28] hover:bg-[#252536] text-[10px] text-[#A3A392] hover:text-[#F5F5DC] transition-colors"
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Personal Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A392] mb-1.5">
              Personal Viewing Notes & Reminders
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Watch with headphones in dark room, recommended for interval twist, don't read Wikipedia spoilers..."
              className="w-full p-3 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-sm text-[#F5F5DC] placeholder-[#4e4e60] focus:border-[#F5B301] focus:outline-none transition-colors"
            />
          </div>
        </form>

        {/* Modal Sticky Footer Bar */}
        <div className="px-6 py-4 border-t border-[#20202E] bg-[#101018] shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#A3A392] hover:text-[#F5F5DC] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <TicketButton
            onClick={handleSubmit}
            variant="gold"
            size="md"
            className="w-full sm:w-auto"
          >
            {isSubmitting
              ? 'Saving...'
              : movieToEdit
                ? 'Update Cinema Entry'
                : 'Add to Watchlist'}
          </TicketButton>
        </div>
      </div>
    </div>
  );
};
