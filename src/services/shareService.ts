import { Movie } from '../types/movie';

export interface ShareMoviePayload {
  t: string; // title
  ot?: string; // originalTitle
  y?: number; // year
  c: string; // contentType
  g: string[]; // genres
  p: string[]; // platforms
  l?: string[]; // languages
  r?: number; // rating
  n?: string; // note/quote
  rb?: string; // recommendedBy / sharer user name
  po?: string; // posterUrl
  s?: string; // short synopsis
}

export interface ShareCollectionPayload {
  u: string; // user name / curator
  t: string; // collection title e.g. "Teja's Top Watched Picks"
  m: ShareMoviePayload[];
  d: string; // date string e.g. "September 2026"
}

/**
 * Encodes movie payload into URL-safe base64 string
 */
export function encodeMovieShareData(movie: Movie, sharerName?: string): string {
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined;
  
  const payload: ShareMoviePayload = {
    t: movie.title,
    ot: movie.originalTitle,
    y: year,
    c: movie.contentType,
    g: movie.genres.slice(0, 3),
    p: movie.platforms.slice(0, 3),
    l: movie.languages.slice(0, 2),
    r: movie.rating,
    n: movie.shareCaption || movie.notes ? (movie.shareCaption || movie.notes)?.slice(0, 280) : undefined,
    rb: sharerName || 'A Cinephile Friend',
    po: movie.posterUrl,
    s: movie.synopsis ? movie.synopsis.slice(0, 240) : undefined,
  };

  try {
    const jsonStr = JSON.stringify(payload);
    // Use UTF-8 safe base64
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    utf8Bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    return btoa(binary);
  } catch (err) {
    console.error('Failed to encode share data:', err);
    return '';
  }
}

/**
 * Decodes movie payload from base64 string
 */
export function decodeMovieShareData(encoded: string): ShareMoviePayload | null {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr) as ShareMoviePayload;
  } catch (err) {
    console.error('Failed to decode share data:', err);
    return null;
  }
}

/**
 * Encodes collection payload into URL-safe base64 string
 */
export function encodeCollectionShareData(
  movies: Movie[],
  curatorName: string,
  collectionTitle: string
): string {
  const items: ShareMoviePayload[] = movies.map((movie) => {
    const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined;
    return {
      t: movie.title,
      ot: movie.originalTitle,
      y: year,
      c: movie.contentType,
      g: movie.genres.slice(0, 2),
      p: movie.platforms.slice(0, 2),
      r: movie.rating,
      n: movie.shareCaption || movie.notes ? (movie.shareCaption || movie.notes)?.slice(0, 140) : undefined,
      po: movie.posterUrl,
      s: movie.synopsis ? movie.synopsis.slice(0, 160) : undefined,
    };
  });

  const payload: ShareCollectionPayload = {
    u: curatorName || 'A Cinephile',
    t: collectionTitle || 'Curated Movie Recommendations',
    m: items,
    d: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  };

  try {
    const jsonStr = JSON.stringify(payload);
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    utf8Bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    return btoa(binary);
  } catch (err) {
    console.error('Failed to encode collection share data:', err);
    return '';
  }
}

/**
 * Decodes collection payload from base64 string
 */
export function decodeCollectionShareData(encoded: string): ShareCollectionPayload | null {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr) as ShareCollectionPayload;
  } catch (err) {
    console.error('Failed to decode collection share data:', err);
    return null;
  }
}

/**
 * Generates formatted text for single movie share
 */
export function formatMovieShareText(movie: Movie, sharerName?: string): string {
  const year = movie.releaseDate ? ` (${new Date(movie.releaseDate).getFullYear()})` : '';
  const rating = movie.rating ? `⭐ ${movie.rating}/10` : '';
  const note = movie.shareCaption || movie.notes ? `\n\n"${movie.shareCaption || movie.notes}"` : '';
  const platforms = movie.platforms.length > 0 ? `\n📺 Watch on: ${movie.platforms.join(', ')}` : '';
  const sharer = sharerName ? `\n👤 Recommended by ${sharerName}` : '';

  return `🎬 ${movie.title}${year}${rating ? ` — ${rating}` : ''}${platforms}${note}${sharer}\n\n🍿 Shared via Movielist`;
}
