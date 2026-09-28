import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Youtube,
  Image as ImageIcon,
  X,
  ExternalLink,
  Sparkles,
  Check,
  AlertCircle,
  Search,
  Globe,
  Loader2,
  RefreshCw,
  Zap,
  Calendar,
  Layers,
  FileImage,
} from 'lucide-react';
import {
  extractYouTubeVideoId,
  getYouTubeThumbnail,
  compressImageFile,
  getPosterSearchLinks,
} from '../../services/posterService';
import {
  fetchPosterCandidates,
  smartFetchMovieMetadata,
  WebPosterCandidate,
  SmartFetchMovieResult,
} from '../../services/smartFetchService';
import { CinematicPosterFallback } from './CinematicPosterFallback';
import { ContentType, CONTENT_TYPE_LABELS } from '../../types/movie';

interface PosterPickerProps {
  title: string;
  originalTitle?: string;
  contentType: ContentType;
  genres: string[];
  releaseDate?: string;
  posterUrl: string;
  onChangePosterUrl: (url: string) => void;
  trailerUrl?: string;
  onSelectMetadataResult?: (result: SmartFetchMovieResult) => void;
}

export const PosterPicker: React.FC<PosterPickerProps> = ({
  title,
  originalTitle,
  contentType,
  genres,
  releaseDate,
  posterUrl,
  onChangePosterUrl,
  trailerUrl,
  onSelectMetadataResult,
}) => {
  // Tabs: 'url' (Pasting a URL), 'upload' (Selecting a local image file), 'web' (Fetching metadata from the web)
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'web'>('url');

  // Tab 1: URL input states
  const [inputUrl, setInputUrl] = useState('');
  const [isImageBroken, setIsImageBroken] = useState(false);

  // Tab 2: Local File Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab 3: Fetch metadata from the web states
  const [webQuery, setWebQuery] = useState(title || '');
  const [webPosters, setWebPosters] = useState<WebPosterCandidate[]>([]);
  const [webMetadataResults, setWebMetadataResults] = useState<SmartFetchMovieResult[]>([]);
  const [isFetchingWeb, setIsFetchingWeb] = useState(false);
  const [hasFetchedWeb, setHasFetchedWeb] = useState(false);
  const [webFetchError, setWebFetchError] = useState<string | null>(null);
  const [lastAutoFilledId, setLastAutoFilledId] = useState<string | null>(null);

  // Keep webQuery synced if title changes and user hasn't searched a custom query
  useEffect(() => {
    if (title && (!webQuery || !hasFetchedWeb)) {
      setWebQuery(title);
    }
  }, [title, hasFetchedWeb, webQuery]);

  const searchLinks = getPosterSearchLinks(webQuery || title || 'Movie', releaseDate);

  // Check if trailer URL can yield a YouTube thumbnail
  const trailerYouTubeId = trailerUrl ? extractYouTubeVideoId(trailerUrl) : null;
  const trailerThumb = trailerYouTubeId ? getYouTubeThumbnail(trailerYouTubeId, 'maxres') : null;

  // Handle URL input change and auto-detect YouTube links
  const handleUrlChange = (val: string) => {
    setInputUrl(val);
    setIsImageBroken(false);
    setUploadError(null);

    const trimmed = val.trim();
    if (!trimmed) {
      onChangePosterUrl('');
      return;
    }

    // Auto-detect YouTube URL
    const ytId = extractYouTubeVideoId(trimmed);
    if (ytId) {
      const ytThumb = getYouTubeThumbnail(ytId, 'maxres');
      if (ytThumb) {
        onChangePosterUrl(ytThumb);
        return;
      }
    }

    onChangePosterUrl(trimmed);
  };

  // Pull thumbnail from trailer URL
  const handleUseTrailerThumbnail = () => {
    if (trailerThumb) {
      onChangePosterUrl(trailerThumb);
      setIsImageBroken(false);
    }
  };

  // Handle local image file upload
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    setIsProcessingUpload(true);
    setUploadError(null);

    try {
      const compressedDataUrl = await compressImageFile(file, 800, 1200, 0.84);
      onChangePosterUrl(compressedDataUrl);
      setIsImageBroken(false);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Failed to process image file.');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Fetch metadata and posters from the web using movie title
  const handleFetchFromWeb = async (queryToSearch?: string) => {
    const query = (queryToSearch || webQuery || title).trim();
    if (!query) {
      setWebFetchError('Please enter a movie title to search metadata and posters.');
      return;
    }

    setIsFetchingWeb(true);
    setWebFetchError(null);

    try {
      const [posterMatches, metadataMatches] = await Promise.all([
        fetchPosterCandidates(query, contentType),
        smartFetchMovieMetadata(query, contentType),
      ]);

      setWebPosters(posterMatches);
      setWebMetadataResults(metadataMatches);
      setHasFetchedWeb(true);

      if (posterMatches.length === 0 && metadataMatches.length === 0) {
        setWebFetchError(`No web metadata or posters found for "${query}". Try alternative keywords or browse links below.`);
      }
    } catch (err: any) {
      console.error('Web metadata fetch failed:', err);
      setWebFetchError('Failed to fetch metadata from web services. Please check your network connection.');
    } finally {
      setIsFetchingWeb(false);
    }
  };

  // Auto-fetch when user switches to 'web' tab if title is present and hasn't searched yet
  const handleSwitchTab = (tab: 'url' | 'upload' | 'web') => {
    setActiveTab(tab);
    if (tab === 'web' && !hasFetchedWeb && (webQuery || title).trim()) {
      handleFetchFromWeb(webQuery || title);
    }
  };

  // Apply complete metadata from a discovered result
  const handleApplyMetadataResult = (result: SmartFetchMovieResult) => {
    if (result.posterUrl) {
      onChangePosterUrl(result.posterUrl);
      setIsImageBroken(false);
    }
    if (onSelectMetadataResult) {
      onSelectMetadataResult(result);
      setLastAutoFilledId(result.id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#A3A392] flex items-center gap-1.5">
          <ImageIcon size={14} className="text-[#F5B301]" />
          <span>Movie Poster / Cover Art</span>
        </label>

        {posterUrl && (
          <button
            type="button"
            onClick={() => {
              onChangePosterUrl('');
              setInputUrl('');
              setIsImageBroken(false);
            }}
            className="text-[11px] text-[#C41E3A] hover:text-[#FF4D6D] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X size={12} />
            <span>Remove poster</span>
          </button>
        )}
      </div>

      {/* Main Container: Live Poster Card Preview (Left) + Tabbed Source Controls (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-3.5 bg-[#0E0E14] border border-[#242436] rounded-2xl">
        {/* Live Poster Preview (4 cols on desktop) */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="w-full max-w-[170px] aspect-[2/3] rounded-xl overflow-hidden border border-[#2E2E44] bg-[#0A0A0F] shadow-lg relative group">
            {posterUrl && !isImageBroken ? (
              <>
                <img
                  src={posterUrl}
                  alt={title || 'Movie Poster Preview'}
                  referrerPolicy="no-referrer"
                  onError={() => setIsImageBroken(true)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-[10px] text-white font-medium mb-2">
                    Current Poster
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onChangePosterUrl('');
                      setInputUrl('');
                    }}
                    className="px-2 py-1 rounded bg-[#C41E3A] text-white text-[10px] flex items-center gap-1 hover:bg-[#E11D48] transition-colors cursor-pointer"
                  >
                    <X size={11} /> Clear
                  </button>
                </div>
              </>
            ) : (
              /* Fallback Cinematic Poster with Movie Vibe Fonts */
              <CinematicPosterFallback
                title={title || 'YOUR MOVIE'}
                originalTitle={originalTitle}
                contentType={contentType}
                genres={genres}
                releaseDate={releaseDate}
                aspect="portrait"
                showBillingBlock={false}
              />
            )}
          </div>

          <div className="mt-2 text-center">
            <span className="text-[10px] text-[#A3A392]">
              {posterUrl && !isImageBroken
                ? 'Custom poster active'
                : 'Using cinematic font poster'}
            </span>
          </div>
        </div>

        {/* Tabbed Poster Controls (8 cols on desktop): URL | Upload | Fetch from Web */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-3">
          {/* Tabbed Navigation: URL, Local File Upload, Fetch from Web */}
          <div className="flex items-center gap-1 p-1 bg-[#14141C] rounded-xl border border-[#20202E]">
            {/* Tab 1: Pasting a URL */}
            <button
              type="button"
              onClick={() => handleSwitchTab('url')}
              className={`flex-1 py-1.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-[#1E1E2C] text-[#F5B301] shadow-sm font-semibold'
                  : 'text-[#737380] hover:text-[#A3A392]'
              }`}
            >
              <LinkIcon size={12} className="shrink-0" />
              <span className="truncate">URL</span>
            </button>

            {/* Tab 2: Selecting a local image file */}
            <button
              type="button"
              onClick={() => handleSwitchTab('upload')}
              className={`flex-1 py-1.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#1E1E2C] text-[#F5B301] shadow-sm font-semibold'
                  : 'text-[#737380] hover:text-[#A3A392]'
              }`}
            >
              <Upload size={12} className="shrink-0" />
              <span className="truncate">Upload</span>
            </button>

            {/* Tab 3: Fetching metadata from the web */}
            <button
              type="button"
              onClick={() => handleSwitchTab('web')}
              className={`flex-1 py-1.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'web'
                  ? 'bg-[#1E1E2C] text-[#F5B301] shadow-sm font-semibold'
                  : 'text-[#737380] hover:text-[#A3A392]'
              }`}
            >
              <Globe size={12} className="shrink-0" />
              <span className="truncate">Fetch Web</span>
            </button>
          </div>

          {/* TAB 1 CONTENT: Pasting a URL */}
          {activeTab === 'url' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-medium text-[#A3A392] mb-1 block">
                  Paste Direct Image Link or YouTube Video URL:
                </label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={posterUrl.startsWith('data:') ? '' : inputUrl || posterUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://... (.jpg, .png, .webp, or YouTube trailer link)"
                    className="w-full h-10 px-3 pr-8 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-xs text-[#F5F5DC] placeholder-[#4e4e60] focus:border-[#F5B301] focus:outline-none"
                  />
                  {(inputUrl || (posterUrl && !posterUrl.startsWith('data:'))) && (
                    <button
                      type="button"
                      onClick={() => handleUrlChange('')}
                      className="absolute right-2 text-[#737380] hover:text-white cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#737380] mt-1.5">
                  Paste any web image URL or a YouTube trailer URL to automatically extract the high-resolution thumbnail.
                </p>
              </div>

              {/* Quick Trailer Extraction helper if YouTube trailer entered in form */}
              {trailerThumb && posterUrl !== trailerThumb && (
                <div className="p-2.5 rounded-xl bg-[#18150F] border border-[#F5B301]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube size={16} className="text-[#FF4444]" />
                    <span className="text-xs text-[#F5F5DC]">
                      YouTube trailer detected in form
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseTrailerThumbnail}
                    className="px-2.5 py-1 rounded-lg bg-[#F5B301] hover:bg-[#D89D01] text-black text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Pull Thumbnail
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2 CONTENT: Selecting a local image file */}
          {activeTab === 'upload' && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                  isDragging
                    ? 'border-[#F5B301] bg-[#F5B301]/10'
                    : 'border-[#2E2E44] bg-[#0A0A0F]/60 hover:border-[#F5B301]/50 hover:bg-[#12121A]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#1C1C28] flex items-center justify-center text-[#F5B301] mb-2">
                  <FileImage size={18} />
                </div>
                <div className="text-xs font-medium text-[#F5F5DC]">
                  {isProcessingUpload
                    ? 'Optimizing & compressing image...'
                    : 'Click to select local file or drag & drop poster'}
                </div>
                <span className="text-[10px] text-[#737380] mt-1">
                  Supports JPEG, PNG, WEBP · Auto-compressed for lightweight offline storage
                </span>
              </div>

              {uploadError && (
                <div className="flex items-center gap-1.5 text-xs text-[#FF4D6D]">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3 CONTENT: Fetching metadata from the web */}
          {activeTab === 'web' && (
            <div className="space-y-3">
              {/* Search bar configured with Movie Title */}
              <div>
                <label className="text-[11px] font-medium text-[#A3A392] mb-1 flex items-center justify-between">
                  <span>Fetch movie metadata & posters:</span>
                  <span className="text-[10px] text-[#737380]">Wikipedia · iTunes · TVMaze</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={webQuery}
                      onChange={(e) => setWebQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleFetchFromWeb();
                        }
                      }}
                      placeholder="Enter movie title (e.g. Inception, Dune, RRR)..."
                      className="w-full h-9 pl-8 pr-3 bg-[#0A0A0F] border border-[#28283C] rounded-xl text-xs text-[#F5F5DC] placeholder-[#4e4e60] focus:border-[#F5B301] focus:outline-none"
                    />
                    <Search size={13} className="absolute left-2.5 top-2.5 text-[#737380]" />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFetchFromWeb()}
                    disabled={isFetchingWeb || !(webQuery || title).trim()}
                    className="px-3 h-9 rounded-xl bg-[#F5B301] hover:bg-[#D89D01] disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {isFetchingWeb ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        <span>Fetch Web Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status and Error Messages */}
              {webFetchError && (
                <div className="flex items-center gap-1.5 text-xs text-[#E11D48] p-2 bg-[#2D0F15] rounded-xl border border-[#E11D48]/30">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{webFetchError}</span>
                </div>
              )}

              {/* Discovered Web Metadata Matches (with auto-fill details option) */}
              {webMetadataResults.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#A3A392]">
                    <span className="flex items-center gap-1">
                      <Zap size={12} className="text-[#F5B301] fill-[#F5B301]" />
                      <span>Web Cinema Matches ({webMetadataResults.length}):</span>
                    </span>
                    <span className="text-[10px] text-[#737380]">Tap to apply poster or all details</span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-1.5 bg-[#0A0A0F] rounded-xl border border-[#20202E]">
                    {webMetadataResults.map((item) => {
                      const isPosterActive = item.posterUrl && posterUrl === item.posterUrl;
                      const isAutoFilled = lastAutoFilledId === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`p-2 rounded-lg border transition-all flex items-center gap-2.5 ${
                            isPosterActive
                              ? 'bg-[#181824] border-[#F5B301]/70 ring-1 ring-[#F5B301]/30'
                              : 'bg-[#12121A] border-[#222232] hover:border-[#383852]'
                          }`}
                        >
                          {/* Mini Poster Thumbnail */}
                          <div className="w-9 h-12 rounded bg-[#0A0A0F] overflow-hidden border border-[#28283C] shrink-0">
                            {item.posterUrl ? (
                              <img
                                src={item.posterUrl}
                                alt={item.cleanTitle}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#737380]">
                                <ImageIcon size={14} />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-[#F5F5DC] truncate">
                                {item.displayTitle}
                              </span>
                              <span className="px-1 py-0.2 rounded text-[8px] bg-[#222234] text-[#A3A392] uppercase font-mono shrink-0">
                                {item.sourceLabel.split(' ')[0]}
                              </span>
                            </div>

                            <div className="text-[10px] text-[#A3A392] flex items-center gap-2 mt-0.5 truncate">
                              {item.releaseDate && (
                                <span className="flex items-center gap-0.5 text-[#F5B301]">
                                  <Calendar size={10} />
                                  <span>{item.releaseDate}</span>
                                </span>
                              )}
                              <span>·</span>
                              <span className="truncate">{item.genres.slice(0, 2).join(', ')}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.posterUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  onChangePosterUrl(item.posterUrl!);
                                  setIsImageBroken(false);
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-medium cursor-pointer transition-colors ${
                                  isPosterActive
                                    ? 'bg-[#F5B301] text-black font-bold'
                                    : 'bg-[#1C1C28] text-[#F5F5DC] hover:text-[#F5B301] border border-[#28283C]'
                                }`}
                                title="Use this poster only"
                              >
                                {isPosterActive ? 'Active Poster' : 'Use Poster'}
                              </button>
                            )}

                            {onSelectMetadataResult && (
                              <button
                                type="button"
                                onClick={() => handleApplyMetadataResult(item)}
                                className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                                  isAutoFilled
                                    ? 'bg-[#2E7D32] text-white'
                                    : 'bg-[#F5B301]/20 hover:bg-[#F5B301]/30 text-[#F5B301] border border-[#F5B301]/40'
                                }`}
                                title="Auto-fill poster, release date, genres, and synopsis"
                              >
                                <Zap size={10} className="fill-current" />
                                <span>{isAutoFilled ? 'Filled' : 'Fill All'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Web Poster Gallery Choices */}
              {webPosters.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#A3A392]">
                    <span>Web Poster Gallery ({webPosters.length} images):</span>
                    {hasFetchedWeb && (
                      <button
                        type="button"
                        onClick={() => handleFetchFromWeb()}
                        disabled={isFetchingWeb}
                        className="text-[10px] text-[#F5B301] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={10} className={isFetchingWeb ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 bg-[#0A0A0F] rounded-xl border border-[#20202E]">
                    {webPosters.map((candidate) => {
                      const isSelected = posterUrl === candidate.url;
                      return (
                        <button
                          key={candidate.id}
                          type="button"
                          onClick={() => {
                            onChangePosterUrl(candidate.url);
                            setIsImageBroken(false);
                          }}
                          className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer group text-left ${
                            isSelected
                              ? 'border-[#F5B301] ring-2 ring-[#F5B301]/40 shadow-lg'
                              : 'border-[#262638] hover:border-[#F5B301]/60'
                          }`}
                        >
                          <img
                            src={candidate.url}
                            alt={candidate.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />

                          {/* Selected Overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#F5B301]/25 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-[#F5B301] text-black flex items-center justify-center shadow-md">
                                <Check size={14} className="stroke-[3]" />
                              </div>
                            </div>
                          )}

                          {/* Source Tag Badge */}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1">
                            <div className="text-[9px] text-[#F5F5DC] font-medium truncate">
                              {candidate.title}
                            </div>
                            <div className="text-[8px] text-[#F5B301] truncate">
                              {candidate.sourceLabel.split(' ')[0]} {candidate.year ? `(${candidate.year})` : ''}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* External Search links fallback */}
              <div className="pt-1">
                <span className="text-[10px] text-[#737380] block mb-1.5">
                  Or explore external movie libraries:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <a
                    href={searchLinks.tmdb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#14141C] hover:bg-[#1E1E2C] border border-[#28283C] text-[11px] text-[#F5F5DC] flex items-center justify-between group transition-colors"
                  >
                    <span className="text-[#01B4E4] font-bold">TMDB</span>
                    <ExternalLink size={10} className="text-[#737380] group-hover:text-[#F5B301]" />
                  </a>

                  <a
                    href={searchLinks.googleImages}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#14141C] hover:bg-[#1E1E2C] border border-[#28283C] text-[11px] text-[#F5F5DC] flex items-center justify-between group transition-colors"
                  >
                    <span className="text-[#4285F4] font-bold">Google</span>
                    <ExternalLink size={10} className="text-[#737380] group-hover:text-[#F5B301]" />
                  </a>

                  <a
                    href={searchLinks.imdb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#14141C] hover:bg-[#1E1E2C] border border-[#28283C] text-[11px] text-[#F5F5DC] flex items-center justify-between group transition-colors"
                  >
                    <span className="text-[#F5C518] font-bold">IMDb</span>
                    <ExternalLink size={10} className="text-[#737380] group-hover:text-[#F5B301]" />
                  </a>

                  <a
                    href={searchLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#14141C] hover:bg-[#1E1E2C] border border-[#28283C] text-[11px] text-[#F5F5DC] flex items-center justify-between group transition-colors"
                  >
                    <span className="text-[#FF0000] font-bold">YouTube</span>
                    <ExternalLink size={10} className="text-[#737380] group-hover:text-[#F5B301]" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Font Note */}
          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#A3A392]">
            <Sparkles size={12} className="text-[#F5B301] shrink-0" />
            <span>
              If no image is provided, Movielist automatically displays a custom poster in high-impact movie typography (<strong className="text-[#F5F5DC]">Cinzel & Bebas Neue</strong>).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
