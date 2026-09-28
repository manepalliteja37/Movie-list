/**
 * Smart Fetch Service
 * Automatically fetches movie and series metadata (official posters, exact release dates,
 * genres, languages, and synopsis) from Wikipedia/Wikidata, TVMaze, and Apple Media APIs
 * with zero required API keys and full CORS compatibility.
 */

import { ContentType, COMMON_GENRES, COMMON_LANGUAGES } from '../types/movie';

export interface SmartFetchMovieResult {
  id: string;
  title: string;
  cleanTitle: string;
  displayTitle: string;
  originalTitle?: string;
  contentType: ContentType;
  year?: number;
  releaseDate?: string; // YYYY-MM-DD
  genres: string[];
  languages: string[];
  platforms?: string[];
  posterUrl?: string;
  synopsis?: string;
  trailerUrl?: string;
  source: 'wikipedia' | 'tvmaze' | 'itunes';
  sourceLabel: string;
  confidence: number;
}

// Map common genre strings to standard COMMON_GENRES
const GENRE_KEYWORD_MAP: Array<{ keywords: string[]; genre: string }> = [
  { keywords: ['sci-fi', 'science fiction', 'space opera', 'cyberpunk', 'dystopian'], genre: 'Sci-Fi' },
  { keywords: ['action', 'martial arts', 'superhero'], genre: 'Action' },
  { keywords: ['thriller', 'psychological thriller', 'suspense'], genre: 'Thriller' },
  { keywords: ['horror', 'slasher', 'supernatural', 'zombie', 'haunted'], genre: 'Horror' },
  { keywords: ['comedy', 'satire', 'parody', 'sitcom', 'dark comedy'], genre: 'Comedy' },
  { keywords: ['love story', 'love', 'heartbroken', 'relationship', 'feel good love story', 'romantic love story'], genre: 'Love Story' },
  { keywords: ['romance', 'romantic'], genre: 'Romance' },
  { keywords: ['drama', 'melodrama', 'period drama', 'historical drama'], genre: 'Drama' },
  { keywords: ['crime', 'heist', 'gangster', 'detective', 'noir'], genre: 'Crime' },
  { keywords: ['mystery'], genre: 'Mystery' },
  { keywords: ['fantasy', 'mythological', 'epic fantasy'], genre: 'Fantasy' },
  { keywords: ['animation', 'animated', 'anime', 'cartoon'], genre: 'Animation' },
  { keywords: ['adventure', 'quest'], genre: 'Adventure' },
  { keywords: ['biography', 'biographical', 'biopic'], genre: 'Biography' },
  { keywords: ['documentary', 'docuseries'], genre: 'Documentary' },
  { keywords: ['musical', 'music'], genre: 'Musical' },
  { keywords: ['war', 'military'], genre: 'War' },
  { keywords: ['western'], genre: 'Western' },
  { keywords: ['sports', 'sport'], genre: 'Sports' },
  { keywords: ['family', 'children'], genre: 'Family' },
  { keywords: ['telugu', 'tollywood'], genre: 'Telugu Cinema' },
];

const LANGUAGE_KEYWORD_MAP: Array<{ keyword: string; lang: string }> = [
  { keyword: 'telugu', lang: 'Telugu' },
  { keyword: 'hindi', lang: 'Hindi' },
  { keyword: 'tamil', lang: 'Tamil' },
  { keyword: 'malayalam', lang: 'Malayalam' },
  { keyword: 'kannada', lang: 'Kannada' },
  { keyword: 'korean', lang: 'Korean' },
  { keyword: 'japanese', lang: 'Japanese' },
  { keyword: 'french', lang: 'French' },
  { keyword: 'spanish', lang: 'Spanish' },
  { keyword: 'german', lang: 'German' },
  { keyword: 'italian', lang: 'Italian' },
  { keyword: 'english', lang: 'English' },
];

/**
 * Extracts genres from text using keyword matches.
 */
function extractGenresFromText(text: string): string[] {
  if (!text) return ['Cinema'];
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  for (const item of GENRE_KEYWORD_MAP) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      matched.add(item.genre);
    }
  }

  return matched.size > 0 ? Array.from(matched) : ['Cinema'];
}

/**
 * Extracts languages from text using keyword matches.
 */
function extractLanguagesFromText(text: string): string[] {
  if (!text) return ['English'];
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  for (const item of LANGUAGE_KEYWORD_MAP) {
    if (lower.includes(item.keyword)) {
      matched.add(item.lang);
    }
  }

  if (matched.size === 0) {
    matched.add('English');
  }

  return Array.from(matched);
}

/**
 * Cleans Wikipedia title formatting: e.g. "Dune (2021 film)" -> "Dune"
 */
function cleanMovieTitle(title: string): { clean: string; year?: number } {
  const match = title.match(/^(.*?)(?:\s*\((?:(\d{4})\s*)?(?:film|series|miniseries|TV series|movie|anime)?\))?$/i);
  let clean = title.replace(/\s*\([^)]*\)\s*$/g, '').trim();
  let year: number | undefined;

  const yearMatch = title.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }

  return { clean: clean || title, year };
}

/**
 * Resolves a high-resolution poster URL from Wikimedia.
 */
function cleanWikimediaPosterUrl(url?: string): string | undefined {
  if (!url) return undefined;
  let cleaned = url;

  // If URL has thumbnail query params or /thumb/, extract clean high-res variant
  if (cleaned.includes('/thumb/')) {
    // Replace width constraint with 1000px width for crystal clarity
    cleaned = cleaned.replace(/\/\d+px-[^/]+$/, '/1000px-' + cleaned.split('/').pop()?.replace(/^\d+px-/, ''));
  }

  // Remove tracking query strings
  cleaned = cleaned.split('?')[0];
  return cleaned;
}

/**
 * Fetches publication date from Wikidata for exact YYYY-MM-DD precision.
 */
async function fetchWikidataReleaseDate(wikibaseId?: string): Promise<string | undefined> {
  if (!wikibaseId) return undefined;
  try {
    const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${wikibaseId}.json`);
    if (!res.ok) return undefined;
    const data = await res.json();
    const entity = data.entities?.[wikibaseId];
    if (!entity) return undefined;

    // P577 is publication date
    const dateClaims = entity.claims?.['P577'];
    if (dateClaims && dateClaims.length > 0) {
      // Find the earliest or standard date
      for (const claim of dateClaims) {
        const timeVal = claim.mainsnak?.datavalue?.value?.time;
        if (timeVal) {
          // Format: "+2024-06-27T00:00:00Z"
          const cleanTime = timeVal.replace(/^\+/, '').split('T')[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(cleanTime)) {
            return cleanTime;
          }
        }
      }
    }
  } catch {
    // Silently fall back
  }
  return undefined;
}

/**
 * Search Wikipedia cinema articles
 */
async function searchWikipedia(query: string): Promise<SmartFetchMovieResult[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query + ' film OR series'
    )}&format=json&origin=*`;

    const res = await fetch(searchUrl);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.query?.search?.slice(0, 4) || [];

    const results: SmartFetchMovieResult[] = [];

    // Parallel fetch summaries
    await Promise.all(
      items.map(async (item: any) => {
        try {
          const sumRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.title)}`
          );
          if (!sumRes.ok) return;
          const summary = await sumRes.json();

          const { clean, year: titleYear } = cleanMovieTitle(summary.title);
          const fullText = `${summary.title} ${summary.description || ''} ${summary.extract || ''}`;

          // Year detection
          let year = titleYear;
          if (!year) {
            const yMatch = (summary.description || '').match(/\b(19\d\d|20\d\d)\b/) ||
                           (summary.extract || '').match(/\b(19\d\d|20\d\d)\b/);
            if (yMatch) year = parseInt(yMatch[1], 10);
          }

          // Content type detection
          let contentType: ContentType = 'movie';
          const lowerDesc = fullText.toLowerCase();
          if (lowerDesc.includes('tv series') || lowerDesc.includes('television series') || lowerDesc.includes('miniseries')) {
            contentType = 'series';
          } else if (lowerDesc.includes('anime')) {
            contentType = 'anime';
          } else if (lowerDesc.includes('short film')) {
            contentType = 'shortfilm';
          }

          // Poster
          const rawPoster = summary.originalimage?.source || summary.thumbnail?.source;
          const posterUrl = cleanWikimediaPosterUrl(rawPoster);

          // Wikidata exact date
          let releaseDate: string | undefined;
          if (summary.wikibase_item) {
            releaseDate = await fetchWikidataReleaseDate(summary.wikibase_item);
          }

          if (!releaseDate && year) {
            releaseDate = `${year}-01-01`;
          }

          const genres = extractGenresFromText(fullText);
          const languages = extractLanguagesFromText(fullText);

          // Clean synopsis (strip introductory title repeating if redundant)
          let synopsis = summary.extract || '';
          if (synopsis.length > 950) {
            synopsis = synopsis.slice(0, 950) + '...';
          }

          results.push({
            id: `wiki-${summary.pageid || Math.random()}`,
            title: clean,
            cleanTitle: clean,
            displayTitle: year ? `${clean} (${year})` : clean,
            contentType,
            year,
            releaseDate,
            genres,
            languages,
            posterUrl,
            synopsis,
            source: 'wikipedia',
            sourceLabel: 'Wikipedia Cinema DB',
            confidence: posterUrl ? 0.9 : 0.7,
          });
        } catch {
          // ignore individual item failure
        }
      })
    );

    return results;
  } catch (err) {
    console.error('Wikipedia smart fetch failed:', err);
    return [];
  }
}

/**
 * Search TVMaze for TV series and shows
 */
async function searchTVMaze(query: string): Promise<SmartFetchMovieResult[]> {
  try {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();

    return (data || []).slice(0, 3).map((item: any) => {
      const show = item.show;
      const rawSummary = show.summary ? show.summary.replace(/<[^>]+>/g, '').trim() : '';
      const year = show.premiered ? parseInt(show.premiered.slice(0, 4), 10) : undefined;
      const genres = show.genres && show.genres.length > 0 ? show.genres : ['Drama'];

      const posterUrl = show.image?.original || show.image?.medium;
      const network = show.webChannel?.name || show.network?.name || 'Streaming';

      return {
        id: `tvmaze-${show.id}`,
        title: show.name,
        cleanTitle: show.name,
        displayTitle: year ? `${show.name} (${year})` : show.name,
        contentType: 'series',
        year,
        releaseDate: show.premiered || (year ? `${year}-01-01` : undefined),
        genres,
        languages: show.language ? [show.language] : ['English'],
        platforms: [network],
        posterUrl,
        synopsis: rawSummary,
        source: 'tvmaze',
        sourceLabel: 'TVMaze Series DB',
        confidence: posterUrl ? 0.95 : 0.75,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Search Apple / iTunes movie database
 */
async function searchITunes(query: string): Promise<SmartFetchMovieResult[]> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&limit=3`
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.results || []).map((m: any) => {
      const year = m.releaseDate ? parseInt(m.releaseDate.slice(0, 4), 10) : undefined;
      const releaseDate = m.releaseDate ? m.releaseDate.split('T')[0] : undefined;
      const posterUrl = m.artworkUrl100 ? m.artworkUrl100.replace('100x100bb', '1000x1000bb') : undefined;

      const genres = m.primaryGenreName ? [m.primaryGenreName] : ['Cinema'];

      return {
        id: `itunes-${m.trackId}`,
        title: m.trackName,
        cleanTitle: m.trackName,
        displayTitle: year ? `${m.trackName} (${year})` : m.trackName,
        contentType: 'movie',
        year,
        releaseDate,
        genres,
        languages: ['English'],
        posterUrl,
        synopsis: m.longDescription || m.shortDescription,
        trailerUrl: m.previewUrl,
        source: 'itunes',
        sourceLabel: 'iTunes Media DB',
        confidence: posterUrl ? 0.92 : 0.7,
      };
    });
  } catch {
    return [];
  }
}

export interface WebPosterCandidate {
  id: string;
  url: string;
  title: string;
  source: 'wikipedia' | 'itunes' | 'tvmaze' | 'wikimedia' | 'custom';
  sourceLabel: string;
  year?: number;
}

/**
 * Searches Wikimedia for cinema posters matching the query
 */
async function searchWikipediaPosters(query: string): Promise<WebPosterCandidate[]> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        query + ' film OR movie OR poster'
      )}&gsrlimit=6&prop=pageimages&piprop=original|thumbnail&pithumbsize=1000&format=json&origin=*`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return [];

    const candidates: WebPosterCandidate[] = [];
    for (const pageId in pages) {
      const page = pages[pageId];
      const rawImg = page.original?.source || page.thumbnail?.source;
      const cleanImg = cleanWikimediaPosterUrl(rawImg);
      if (cleanImg) {
        const { clean, year } = cleanMovieTitle(page.title);
        candidates.push({
          id: `wiki-poster-${pageId}`,
          url: cleanImg,
          title: clean,
          source: 'wikipedia',
          sourceLabel: 'Wikipedia Cinema DB',
          year,
        });
      }
    }
    return candidates;
  } catch {
    return [];
  }
}

/**
 * Searches Apple / iTunes for high-resolution movie and show artwork (up to 1200px)
 */
async function searchITunesPosters(query: string): Promise<WebPosterCandidate[]> {
  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&limit=4`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=tvShow&limit=3`).then((r) =>
        r.ok ? r.json() : null
      ),
    ]);

    const candidates: WebPosterCandidate[] = [];
    const processItems = (results: any[], sourceLabel: string) => {
      for (const m of results || []) {
        const rawArt = m.artworkUrl100 || m.artworkUrl60;
        if (rawArt) {
          const highRes = rawArt.replace(/\/\d+x\d+bb/, '/1200x1200bb');
          const year = m.releaseDate ? parseInt(m.releaseDate.slice(0, 4), 10) : undefined;
          candidates.push({
            id: `itunes-poster-${m.trackId || m.collectionId || Math.random()}`,
            url: highRes,
            title: m.trackName || m.collectionName || query,
            source: 'itunes',
            sourceLabel,
            year,
          });
        }
      }
    };

    if (movieRes?.results) processItems(movieRes.results, 'iTunes High-Res Media');
    if (tvRes?.results) processItems(tvRes.results, 'iTunes TV Artwork');

    return candidates;
  } catch {
    return [];
  }
}

/**
 * Searches TVMaze for show poster artwork
 */
async function searchTVMazePosters(query: string): Promise<WebPosterCandidate[]> {
  try {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data || [])
      .filter((item: any) => item.show?.image?.original || item.show?.image?.medium)
      .map((item: any) => {
        const show = item.show;
        const year = show.premiered ? parseInt(show.premiered.slice(0, 4), 10) : undefined;
        return {
          id: `tvmaze-poster-${show.id}`,
          url: show.image.original || show.image.medium,
          title: show.name,
          source: 'tvmaze' as const,
          sourceLabel: 'TVMaze Series DB',
          year,
        };
      });
  } catch {
    return [];
  }
}

/**
 * Dedicated fetcher for Web Posters:
 * Aggregates high-res poster candidates across Wikipedia, Apple iTunes, and TVMaze
 * with zero required keys and instant CORS resolution.
 */
export async function fetchPosterCandidates(
  query: string,
  preferredType?: ContentType
): Promise<WebPosterCandidate[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const [wikiPosters, itunesPosters, tvmazePosters] = await Promise.all([
      searchWikipediaPosters(trimmed),
      searchITunesPosters(trimmed),
      preferredType === 'movie' ? Promise.resolve([]) : searchTVMazePosters(trimmed),
    ]);

    const all = [...itunesPosters, ...wikiPosters, ...tvmazePosters];
    const seenUrls = new Set<string>();
    const unique: WebPosterCandidate[] = [];

    for (const item of all) {
      if (item.url && !seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        unique.push(item);
      }
    }

    return unique.slice(0, 10);
  } catch (err) {
    console.error('fetchPosterCandidates failed:', err);
    return [];
  }
}

/**
 * Main Smart Fetch Search API: Queries multi-source knowledge bases,
 * ranks and deduplicates, and returns rich movie metadata.
 */
export async function smartFetchMovieMetadata(
  query: string,
  preferredType?: ContentType
): Promise<SmartFetchMovieResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Run in parallel
  const [wikiResults, tvmazeResults, itunesResults] = await Promise.all([
    searchWikipedia(trimmed),
    preferredType === 'movie' ? Promise.resolve([]) : searchTVMaze(trimmed),
    preferredType === 'series' ? Promise.resolve([]) : searchITunes(trimmed),
  ]);

  // Combine and deduplicate
  const allResults = [...wikiResults, ...tvmazeResults, ...itunesResults];

  const seen = new Set<string>();
  const uniqueResults: SmartFetchMovieResult[] = [];

  // Sort: prioritize results that have a posterUrl and high confidence
  allResults.sort((a, b) => {
    if (a.posterUrl && !b.posterUrl) return -1;
    if (!a.posterUrl && b.posterUrl) return 1;
    return b.confidence - a.confidence;
  });

  for (const item of allResults) {
    const key = `${item.cleanTitle.toLowerCase()}-${item.year || ''}-${item.contentType}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(item);
    }
  }

  return uniqueResults.slice(0, 6);
}

/**
 * YouTube Metadata Auto-Fetcher for Short Films & Videos
 * Automatically pulls Title (Name), Genre, Language, Release Date, and Poster from YouTube URL.
 */
import { extractYouTubeVideoId, getYouTubeThumbnail } from './posterService';

export interface YouTubeMetadataResult {
  title: string;
  cleanTitle: string;
  genres: string[];
  languages: string[];
  releaseDate: string;
  year?: number;
  posterUrl: string;
  trailerUrl: string;
}

export function parseYouTubeTitleMetadata(rawTitle: string): {
  cleanTitle: string;
  genres: string[];
  languages: string[];
  releaseDate: string;
  year?: number;
} {
  const todayStr = new Date().toISOString().split('T')[0];

  if (!rawTitle) {
    return {
      cleanTitle: 'YouTube Short Film',
      genres: ['Love Story'],
      languages: ['Telugu'],
      releaseDate: todayStr,
    };
  }

  // 1. Extract Year
  let year: number | undefined;
  const yearMatch = rawTitle.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }

  const defaultDate = year ? `${year}-01-01` : todayStr;

  // 2. Extract Languages
  const languages = extractLanguagesFromText(rawTitle);
  if (languages.length === 1 && languages[0] === 'English' && /telugu/i.test(rawTitle)) {
    languages[0] = 'Telugu';
  } else if (languages.length === 0) {
    languages.push('Telugu');
  }

  // 3. Extract Genres
  const genres = extractGenresFromText(rawTitle);
  if (/love|heart|relationship|feel good|prem/i.test(rawTitle) && !genres.includes('Love Story')) {
    genres.unshift('Love Story');
  }
  if (genres.length === 1 && genres[0] === 'Cinema') {
    genres[0] = 'Love Story';
  }

  // 4. Extract Clean Title
  const parts = rawTitle
    .split(/[-|:;/[\]()•]+/)
    .map((p) => p.trim())
    .filter((p) => {
      const lower = p.toLowerCase();
      if (!lower) return false;
      if (
        lower.includes('short film') ||
        lower.includes('shortfilm') ||
        lower.includes('full movie') ||
        lower.includes('official') ||
        lower.includes('trailer') ||
        lower.includes('teaser') ||
        lower.includes('4k') ||
        lower.includes('hd') ||
        lower.includes('award winning') ||
        lower.includes('directed by') ||
        lower.includes('dir by')
      ) {
        return false;
      }
      return true;
    });

  let cleanTitle = parts.length > 0 && parts[0].length >= 2 ? parts[0] : rawTitle.trim();
  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();

  return {
    cleanTitle: cleanTitle || 'YouTube Short Film',
    genres,
    languages,
    releaseDate: defaultDate,
    year,
  };
}

export async function fetchYouTubeMetadata(urlOrId: string): Promise<YouTubeMetadataResult | null> {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) return null;

  const trailerUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const posterUrl = getYouTubeThumbnail(videoId, 'maxres') || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  let rawTitle = '';

  try {
    const oembedResp = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(trailerUrl)}&format=json`);
    if (oembedResp.ok) {
      const data = await oembedResp.json();
      rawTitle = data.title || '';
    }
  } catch {
    // network / cors fallback
  }

  if (!rawTitle) {
    try {
      const noembedResp = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(trailerUrl)}`);
      if (noembedResp.ok) {
        const data = await noembedResp.json();
        rawTitle = data.title || '';
      }
    } catch {
      // network fallback
    }
  }

  const parsed = parseYouTubeTitleMetadata(rawTitle);

  return {
    title: rawTitle,
    cleanTitle: parsed.cleanTitle,
    genres: parsed.genres,
    languages: parsed.languages,
    releaseDate: parsed.releaseDate,
    year: parsed.year,
    posterUrl,
    trailerUrl,
  };
}

