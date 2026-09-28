import React from 'react';
import { ContentType, CONTENT_TYPE_LABELS } from '../../types/movie';
import { FilmReelIcon } from './CinematicIcons';
import { getGenrePosterTheme } from '../../services/posterService';

interface CinematicPosterFallbackProps {
  title: string;
  originalTitle?: string;
  contentType?: ContentType;
  genres?: string[];
  releaseDate?: string;
  year?: number | string;
  platforms?: string[];
  aspect?: 'portrait' | 'banner';
  className?: string;
  showBillingBlock?: boolean;
  hideTopHeader?: boolean;
}

export const CinematicPosterFallback: React.FC<CinematicPosterFallbackProps> = ({
  title,
  originalTitle,
  contentType = 'movie',
  genres = ['Cinema'],
  className = '',
  hideTopHeader = false,
}) => {
  const theme = getGenrePosterTheme(genres);

  const firstLetter = title ? title.trim().charAt(0).toUpperCase() : 'M';
  const displayGenres = genres && genres.length > 0 ? genres.slice(0, 2).join(' · ').toUpperCase() : 'CINEMA';

  // Dynamic font sizing & line spacing calculation:
  // If any single word in title > 8 characters (or total length > 14), decrease font size and decrease line spacing
  const getTitleStyleClasses = (titleText: string) => {
    if (!titleText) return 'text-lg sm:text-xl leading-snug tracking-wider';
    const words = titleText.trim().split(/\s+/);
    const maxWordLength = Math.max(...words.map((w) => w.length), 0);
    const totalLength = titleText.trim().length;

    if (maxWordLength > 12 || totalLength > 24) {
      return 'text-xs sm:text-sm lg:text-base leading-none tracking-normal';
    } else if (maxWordLength > 8 || totalLength > 14) {
      return 'text-sm sm:text-base lg:text-lg leading-tight tracking-wide';
    } else {
      return 'text-lg sm:text-xl lg:text-2xl leading-snug tracking-wider';
    }
  };

  const titleClasses = getTitleStyleClasses(title);

  return (
    <div
      className={`cinematic-poster-fallback relative w-full h-full overflow-hidden select-none flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-b ${theme.gradient} ${className}`}
    >
      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />

      {/* Anamorphic Lens Flare Line across top-center */}
      <div
        className={`absolute top-1/4 left-0 right-0 h-[1.5px] bg-gradient-to-r ${theme.flareColor} opacity-70 pointer-events-none blur-[0.5px]`}
      />

      {/* Film Grain Dot Texture */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Giant Stylized Monogram in the Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span
          className="font-cinema text-9xl sm:text-[11rem] font-black opacity-[0.06] transform scale-110 tracking-tighter"
          style={{ color: theme.accentColor }}
        >
          {firstLetter}
        </span>
      </div>

      {/* Top Header of Poster */}
      {!hideTopHeader && (
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <span
              className={`content-type-badge px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-semibold border ${theme.accentBorder} ${theme.badgeBg}`}
            >
              {CONTENT_TYPE_LABELS[contentType] || contentType}
            </span>
            <span className="text-[10px] text-white/30 font-mono">
              {theme.genreSymbol}
            </span>
          </div>

          <div className="poster-reel-badge flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0">
            <FilmReelIcon size={18} className="animate-spin-slow" />
          </div>
        </div>
      )}

      {/* Center Zone: Genre & Movie Name */}
      <div className="relative z-10 my-auto text-center px-2 py-3 w-full flex flex-col items-center justify-center">
        {/* Genre Line */}
        <div className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-[#F5B301] mb-2 flex items-center gap-2 font-semibold fallback-genre-line">
          <span className="w-3.5 h-[1px] bg-[#F5B301]/40 fallback-genre-divider" />
          <span className="fallback-genre-text">{displayGenres}</span>
          <span className="w-3.5 h-[1px] bg-[#F5B301]/40 fallback-genre-divider" />
        </div>

        {/* Main Title (Movie Name) */}
        <h3
          className={`font-cinema font-bold text-[#F5F5DC] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] max-w-full break-words ${titleClasses}`}
          style={{
            textShadow: `0 0 20px ${theme.accentColor}33, 0 2px 4px rgba(0,0,0,0.9)`,
          }}
        >
          {title || 'UNTITLED FILM'}
        </h3>

        {/* Original Native Script / Secondary Title */}
        {originalTitle && originalTitle !== title && (
          <div className="text-xs sm:text-sm text-[#A3A392] font-telugu mt-1.5 opacity-90 drop-shadow line-clamp-1">
            {originalTitle}
          </div>
        )}

        {/* Vintage Poster Star Ornament */}
        <div className="flex items-center gap-2 mt-2.5 opacity-40">
          <div className="w-6 sm:w-8 h-[1px] bg-gradient-to-r from-transparent to-[#F5F5DC]" />
          <span className="text-[9px] text-[#F5B301]">★</span>
          <div className="w-6 sm:w-8 h-[1px] bg-gradient-to-l from-transparent to-[#F5F5DC]" />
        </div>
      </div>
    </div>
  );
};
