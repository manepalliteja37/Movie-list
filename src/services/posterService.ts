/**
 * Poster Service
 * Handles extraction of images from YouTube trailers, OTT links, direct image URLs,
 * local image file upload compression, and cinematic poster styling presets.
 */

/**
 * Extracts YouTube Video ID from standard, short, embed, or mobile URLs.
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Handle standard watch URLs: youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // Check if string is already just an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Generates YouTube thumbnail URLs for a given video ID or video link.
 */
export function getYouTubeThumbnail(
  urlOrId: string,
  quality: 'maxres' | 'hq' | 'mq' = 'maxres'
): string | null {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) return null;

  switch (quality) {
    case 'maxres':
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    case 'hq':
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    case 'mq':
    default:
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
}

/**
 * Checks if a string looks like a direct image URL or image CDN.
 */
export function isDirectImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();

  // Data URLs (e.g. from local file upload)
  if (trimmed.startsWith('data:image/')) return true;

  // Image file extensions
  if (/\.(jpeg|jpg|png|webp|avif|gif|svg)(\?.*)?$/i.test(trimmed)) return true;

  // Known image CDNs and poster domains
  const imageCdns = [
    'img.youtube.com',
    'i.ytimg.com',
    'images.unsplash.com',
    'm.media-amazon.com',
    'occ-0-',
    'occ.',
    'netflix.',
    'image.tmdb.org',
    'themoviedb.org/t/p',
    'ia.media-imdb.com',
    'static.wikia.nocookie.net',
    'hotstar.com',
    'disneyplus.',
  ];

  return imageCdns.some((cdn) => trimmed.includes(cdn));
}

/**
 * Compresses and resizes a user-uploaded image using an off-screen HTML Canvas.
 * Keeps output under ~150KB to preserve localStorage quota while maintaining high visual quality.
 */
export function compressImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 1200,
  quality = 0.84
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please upload a valid image file (JPEG, PNG, WEBP).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data.'));
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context unavailable.'));
        }

        // Fill black background in case of transparent PNGs
        ctx.fillStyle = '#0A0A0F';
        ctx.fillRect(0, 0, width, height);

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP if supported, or JPEG
        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Returns external search links to find official posters on Google Images, TMDB, or IMDb.
 */
export function getPosterSearchLinks(title: string, year?: number | string) {
  const query = `${title} ${year || ''} movie poster official`.trim();
  const encoded = encodeURIComponent(query);
  const titleEncoded = encodeURIComponent(title);

  return {
    googleImages: `https://www.google.com/search?tbm=isch&q=${encoded}`,
    tmdb: `https://www.themoviedb.org/search?query=${titleEncoded}`,
    imdb: `https://www.imdb.com/find?q=${titleEncoded}&s=tt&ttype=ft`,
    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' official trailer')}`,
  };
}

export interface GenreTheme {
  gradient: string;
  accentColor: string;
  accentBorder: string;
  badgeBg: string;
  fontClass: string;
  flareColor: string;
  genreSymbol: string;
}

/**
 * Computes a rich, cinematic poster theme based on genres for when no poster image is uploaded.
 */
export function getGenrePosterTheme(genres: string[] = []): GenreTheme {
  const g = genres.map((item) => item.toLowerCase());

  if (g.some((x) => x.includes('sci-fi') || x.includes('science fiction') || x.includes('cyber') || x.includes('space'))) {
    return {
      gradient: 'from-[#0A1628] via-[#0D1B2A] to-[#050811]',
      accentColor: '#00F0FF',
      accentBorder: 'border-[#00F0FF]/40',
      badgeBg: 'bg-[#00F0FF]/15 text-[#00F0FF]',
      fontClass: 'font-cinema tracking-widest',
      flareColor: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      genreSymbol: '✦',
    };
  }

  if (g.some((x) => x.includes('action') || x.includes('thriller') || x.includes('crime') || x.includes('mystery'))) {
    return {
      gradient: 'from-[#2A0C14] via-[#1A080E] to-[#0A0507]',
      accentColor: '#FF3355',
      accentBorder: 'border-[#FF3355]/40',
      badgeBg: 'bg-[#FF3355]/15 text-[#FF3355]',
      fontClass: 'font-poster tracking-wide',
      flareColor: 'from-red-600/25 via-amber-600/10 to-transparent',
      genreSymbol: '▲',
    };
  }

  if (g.some((x) => x.includes('horror') || x.includes('supernatural'))) {
    return {
      gradient: 'from-[#14081E] via-[#0E0514] to-[#050208]',
      accentColor: '#C084FC',
      accentBorder: 'border-[#C084FC]/40',
      badgeBg: 'bg-[#C084FC]/15 text-[#C084FC]',
      fontClass: 'font-cinema-decorative tracking-wider',
      flareColor: 'from-purple-600/25 via-emerald-600/10 to-transparent',
      genreSymbol: '❖',
    };
  }

  if (g.some((x) => x.includes('period') || x.includes('history') || x.includes('biography') || x.includes('mythology') || x.includes('epic'))) {
    return {
      gradient: 'from-[#281E0C] via-[#1B1408] to-[#0A0804]',
      accentColor: '#F5B301',
      accentBorder: 'border-[#F5B301]/50',
      badgeBg: 'bg-[#F5B301]/15 text-[#F5B301]',
      fontClass: 'font-cinema tracking-widest',
      flareColor: 'from-amber-400/25 via-yellow-600/10 to-transparent',
      genreSymbol: '⚜',
    };
  }

  if (g.some((x) => x.includes('romance') || x.includes('comedy') || x.includes('musical'))) {
    return {
      gradient: 'from-[#280F1F] via-[#190A13] to-[#0A0508]',
      accentColor: '#F472B6',
      accentBorder: 'border-[#F472B6]/40',
      badgeBg: 'bg-[#F472B6]/15 text-[#F472B6]',
      fontClass: 'font-cinema tracking-wider',
      flareColor: 'from-pink-500/20 via-rose-500/10 to-transparent',
      genreSymbol: '♥',
    };
  }

  if (g.some((x) => x.includes('anime') || x.includes('animation') || x.includes('fantasy') || x.includes('adventure'))) {
    return {
      gradient: 'from-[#1A1230] via-[#110B22] to-[#07040E]',
      accentColor: '#A78BFA',
      accentBorder: 'border-[#A78BFA]/40',
      badgeBg: 'bg-[#A78BFA]/15 text-[#A78BFA]',
      fontClass: 'font-cinema tracking-widest',
      flareColor: 'from-indigo-500/25 via-purple-500/10 to-transparent',
      genreSymbol: '★',
    };
  }

  // Default Cinematic Noir / Blockbuster Gold
  return {
    gradient: 'from-[#1C1C28] via-[#12121A] to-[#0A0A0F]',
    accentColor: '#F5B301',
    accentBorder: 'border-[#F5B301]/40',
    badgeBg: 'bg-[#F5B301]/15 text-[#F5B301]',
    fontClass: 'font-cinema tracking-widest',
    flareColor: 'from-amber-500/20 via-red-500/10 to-transparent',
    genreSymbol: '🎬',
  };
}
