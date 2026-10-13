/**
 * Smart Fetch Service
 * Automatically fetches movie and series metadata (official posters, exact release dates,
 * genres, languages, and synopsis) from Wikipedia/Wikidata, TVMaze, and Apple Media APIs
 * with zero required API keys and full CORS compatibility.
 */

import { ContentType, COMMON_GENRES, COMMON_LANGUAGES } from '../types/movie';
import { useMovieStore } from '../store/useMovieStore';

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
  source: 'wikipedia' | 'tvmaze' | 'itunes' | 'anilist' | 'cinemeta' | 'tmdb' | 'omdb';
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

/**
 * Search AniList GraphQL API for anime series and movies.
 * 100% free, keyless, CORS-enabled, official GraphQL endpoint.
 */
export async function searchAniList(query: string): Promise<SmartFetchMovieResult[]> {
  try {
    const gql = `
      query ($search: String) {
        Page(page: 1, perPage: 6) {
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
            id
            title {
              romaji
              english
              native
            }
            format
            description(asHtml: false)
            startDate {
              year
              month
              day
            }
            genres
            averageScore
            coverImage {
              extraLarge
              large
            }
            bannerImage
            trailer {
              id
              site
            }
          }
        }
      }
    `;

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query: gql, variables: { search: query } }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const mediaList = data.data?.Page?.media || [];

    return mediaList.map((m: any) => {
      const englishTitle = m.title?.english;
      const romajiTitle = m.title?.romaji;
      const nativeTitle = m.title?.native;
      const titleName = englishTitle || romajiTitle || query;
      const year = m.startDate?.year;

      let releaseDate: string | undefined;
      if (m.startDate?.year && m.startDate?.month && m.startDate?.day) {
        const mm = String(m.startDate.month).padStart(2, '0');
        const dd = String(m.startDate.day).padStart(2, '0');
        releaseDate = `${m.startDate.year}-${mm}-${dd}`;
      } else if (year) {
        releaseDate = `${year}-01-01`;
      }

      const genres = Array.isArray(m.genres) && m.genres.length > 0 ? [...m.genres] : ['Animation'];
      if (!genres.includes('Animation')) {
        genres.push('Animation');
      }

      const rawDesc = m.description || '';
      const cleanSynopsis = rawDesc.replace(/<[^>]+>/g, '').trim();
      const posterUrl = m.coverImage?.extraLarge || m.coverImage?.large;

      let trailerUrl: string | undefined;
      if (m.trailer?.site === 'youtube' && m.trailer?.id) {
        trailerUrl = `https://www.youtube.com/watch?v=${m.trailer.id}`;
      }

      return {
        id: `anilist-${m.id}`,
        title: titleName,
        cleanTitle: titleName,
        displayTitle: year ? `${titleName} (${year})` : titleName,
        originalTitle: nativeTitle || (romajiTitle !== titleName ? romajiTitle : undefined),
        contentType: 'anime' as ContentType,
        year,
        releaseDate,
        genres,
        languages: ['Japanese'],
        posterUrl,
        synopsis: cleanSynopsis,
        trailerUrl,
        source: 'anilist' as const,
        sourceLabel: 'AniList Anime DB',
        confidence: 0.98,
      };
    });
  } catch (err) {
    console.warn('AniList search failed:', err);
    return [];
  }
}

/**
 * Fallback Anime search via Jikan (Unofficial MyAnimeList API)
 */
export async function searchJikan(query: string): Promise<SmartFetchMovieResult[]> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=4`);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.data || [];

    return items.map((item: any) => {
      const titleName = item.title_english || item.title || query;
      const year = item.year || item.aired?.prop?.from?.year;
      let releaseDate: string | undefined;
      if (item.aired?.from) {
        releaseDate = item.aired.from.split('T')[0];
      } else if (year) {
        releaseDate = `${year}-01-01`;
      }

      const genres = (item.genres || []).map((g: any) => g.name).filter(Boolean);
      if (!genres.includes('Animation')) genres.push('Animation');

      const posterUrl = item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url;

      return {
        id: `jikan-${item.mal_id}`,
        title: titleName,
        cleanTitle: titleName,
        displayTitle: year ? `${titleName} (${year})` : titleName,
        originalTitle: item.title_japanese,
        contentType: 'anime' as ContentType,
        year,
        releaseDate,
        genres,
        languages: ['Japanese'],
        posterUrl,
        synopsis: item.synopsis ? item.synopsis.replace(/\[Written by MAL Rewrite\]/g, '').trim() : undefined,
        trailerUrl: item.trailer?.url,
        source: 'anilist' as const,
        sourceLabel: 'Jikan Anime DB',
        confidence: 0.92,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Search Cinemeta (Open IMDB Movie & Series database)
 * 100% free, keyless, CORS-enabled.
 * Fetches recent releases (e.g. 2024, 2025, 2026), Telugu, Bollywood, Hollywood, and global cinema.
 */
export async function searchCinemeta(
  query: string,
  preferredType?: ContentType
): Promise<SmartFetchMovieResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const promises: Promise<any>[] = [];

    if (preferredType !== 'series' && preferredType !== 'anime') {
      promises.push(
        fetch(`https://v3-cinemeta.strem.io/catalog/movie/top/search=${encoded}.json`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      );
    }
    if (preferredType !== 'movie' && preferredType !== 'shortfilm') {
      promises.push(
        fetch(`https://v3-cinemeta.strem.io/catalog/series/top/search=${encoded}.json`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      );
    }

    const responses = await Promise.all(promises);
    const items: any[] = [];
    for (const res of responses) {
      if (res?.metas) {
        items.push(...res.metas);
      }
    }

    if (items.length === 0) return [];

    const topItems = items.slice(0, 4);
    const enrichedResults: SmartFetchMovieResult[] = await Promise.all(
      topItems.map(async (item: any) => {
        const itemType = item.type === 'series' ? 'series' : 'movie';
        let detail: any = item;
        try {
          const detailRes = await fetch(
            `https://v3-cinemeta.strem.io/meta/${itemType}/${item.id}.json`
          );
          if (detailRes.ok) {
            const detailJson = await detailRes.json();
            if (detailJson.meta) {
              detail = detailJson.meta;
            }
          }
        } catch {
          // fallback
        }

        const year = detail.year
          ? parseInt(String(detail.year).slice(0, 4), 10)
          : detail.releaseInfo
          ? parseInt(String(detail.releaseInfo).slice(0, 4), 10)
          : undefined;

        let releaseDate: string | undefined;
        if (detail.released) {
          const d = detail.released.split('T')[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            releaseDate = d;
          }
        }
        if (!releaseDate && year) {
          releaseDate = `${year}-01-01`;
        }

        let genres: string[] = [];
        if (Array.isArray(detail.genres) && detail.genres.length > 0) {
          genres = detail.genres;
        } else {
          genres = extractGenresFromText(`${detail.name} ${detail.description || ''}`);
        }

        let posterUrl = detail.poster;
        if (posterUrl) {
          if (posterUrl.includes('images.metahub.space/poster/small/')) {
            posterUrl = posterUrl.replace('/poster/small/', '/poster/medium/');
          } else if (posterUrl.includes('m.media-amazon.com/images/M/') && posterUrl.includes('._V1_')) {
            posterUrl = posterUrl.replace(/\._V1_.*?\.jpg$/, '._V1_SX1000.jpg');
          }
        }

        const isSeries = itemType === 'series';
        const contentType: ContentType = isSeries ? 'series' : 'movie';

        return {
          id: `cinemeta-${detail.id || detail.imdb_id}`,
          title: detail.name || query,
          cleanTitle: detail.name || query,
          displayTitle: year ? `${detail.name} (${year})` : detail.name,
          contentType,
          year,
          releaseDate,
          genres,
          languages: extractLanguagesFromText(`${detail.name} ${detail.description || ''}`),
          posterUrl,
          synopsis: detail.description,
          source: 'cinemeta' as const,
          sourceLabel: 'IMDb / Cinemeta DB',
          confidence: 0.95,
        };
      })
    );

    return enrichedResults;
  } catch (err) {
    console.warn('Cinemeta search failed:', err);
    return [];
  }
}

/**
 * Search TMDB Multi (Movies & TV Series) with user's TMDB API key.
 */
export async function searchTMDB(
  query: string,
  apiKey: string,
  preferredType?: ContentType
): Promise<SmartFetchMovieResult[]> {
  if (!apiKey || !apiKey.trim()) return [];
  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(
      apiKey.trim()
    )}&query=${encodeURIComponent(query)}&include_adult=false`;

    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const results = (data.results || []).slice(0, 5);

    const TMDB_GENRES: Record<number, string> = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Musical', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
      10770: 'Cinema', 53: 'Thriller', 10752: 'War', 37: 'Western',
      10759: 'Action', 10765: 'Sci-Fi', 10768: 'War',
    };

    return results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => {
        const isTv = item.media_type === 'tv';
        const title = isTv ? item.name : item.title;
        const originalTitle = isTv ? item.original_name : item.original_title;
        const rawDate = isTv ? item.first_air_date : item.release_date;
        const year = rawDate ? parseInt(rawDate.slice(0, 4), 10) : undefined;
        const releaseDate = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : (year ? `${year}-01-01` : undefined);

        let contentType: ContentType = isTv ? 'series' : 'movie';
        if (item.genre_ids?.includes(16) && (item.origin_country?.includes('JP') || item.original_language === 'ja')) {
          contentType = 'anime';
        }

        const genres = (item.genre_ids || [])
          .map((gid: number) => TMDB_GENRES[gid])
          .filter(Boolean);
        if (genres.length === 0) genres.push(isTv ? 'Drama' : 'Cinema');

        const posterUrl = item.poster_path
          ? `https://image.tmdb.org/t/p/w780${item.poster_path}`
          : undefined;

        const langCode = item.original_language;
        const languages = langCode === 'te' ? ['Telugu'] :
                          langCode === 'hi' ? ['Hindi'] :
                          langCode === 'ta' ? ['Tamil'] :
                          langCode === 'ja' ? ['Japanese'] :
                          langCode === 'ko' ? ['Korean'] :
                          langCode === 'es' ? ['Spanish'] :
                          langCode === 'fr' ? ['French'] : ['English'];

        return {
          id: `tmdb-${item.id}`,
          title: title || query,
          cleanTitle: title || query,
          displayTitle: year ? `${title} (${year})` : title,
          originalTitle: originalTitle !== title ? originalTitle : undefined,
          contentType,
          year,
          releaseDate,
          genres,
          languages,
          posterUrl,
          synopsis: item.overview,
          source: 'tmdb' as const,
          sourceLabel: 'TMDB Official API',
          confidence: 0.99,
        };
      });
  } catch (err) {
    console.warn('TMDB search failed:', err);
    return [];
  }
}

/**
 * Search OMDb API with user's OMDb API key.
 */
export async function searchOMDb(
  query: string,
  apiKey: string,
  preferredType?: ContentType
): Promise<SmartFetchMovieResult[]> {
  if (!apiKey || !apiKey.trim()) return [];
  try {
    const typeParam = preferredType === 'series' ? '&type=series' : preferredType === 'movie' ? '&type=movie' : '';
    const searchUrl = `https://www.omdbapi.com/?apikey=${encodeURIComponent(apiKey.trim())}&s=${encodeURIComponent(query)}${typeParam}`;

    const res = await fetch(searchUrl);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.Response === 'False' || !data.Search) return [];

    const items = data.Search.slice(0, 4);
    const enriched: SmartFetchMovieResult[] = await Promise.all(
      items.map(async (item: any) => {
        let detail: any = item;
        try {
          const detailRes = await fetch(
            `https://www.omdbapi.com/?apikey=${encodeURIComponent(apiKey.trim())}&i=${item.imdbID}&plot=full`
          );
          if (detailRes.ok) {
            const dj = await detailRes.json();
            if (dj.Response !== 'False') detail = dj;
          }
        } catch {
          // fallback to item
        }

        const year = detail.Year ? parseInt(detail.Year.slice(0, 4), 10) : undefined;
        let releaseDate: string | undefined;
        if (detail.Released && detail.Released !== 'N/A') {
          const parsed = new Date(detail.Released);
          if (!isNaN(parsed.getTime())) {
            releaseDate = parsed.toISOString().split('T')[0];
          }
        }
        if (!releaseDate && year) {
          releaseDate = `${year}-01-01`;
        }

        const genres = detail.Genre && detail.Genre !== 'N/A'
          ? detail.Genre.split(',').map((g: string) => g.trim())
          : ['Cinema'];

        const languages = detail.Language && detail.Language !== 'N/A'
          ? detail.Language.split(',').map((l: string) => l.trim())
          : ['English'];

        const posterUrl = detail.Poster && detail.Poster !== 'N/A' ? detail.Poster : undefined;
        const contentType: ContentType = detail.Type === 'series' ? 'series' : 'movie';

        return {
          id: `omdb-${detail.imdbID}`,
          title: detail.Title || query,
          cleanTitle: detail.Title || query,
          displayTitle: year ? `${detail.Title} (${year})` : detail.Title,
          contentType,
          year,
          releaseDate,
          genres,
          languages,
          posterUrl,
          synopsis: detail.Plot !== 'N/A' ? detail.Plot : undefined,
          source: 'omdb' as const,
          sourceLabel: 'OMDb API',
          confidence: 0.96,
        };
      })
    );

    return enriched;
  } catch (err) {
    console.warn('OMDb search failed:', err);
    return [];
  }
}

export interface WebPosterCandidate {
  id: string;
  url: string;
  title: string;
  source: 'wikipedia' | 'itunes' | 'tvmaze' | 'wikimedia' | 'custom' | 'anilist' | 'cinemeta' | 'tmdb' | 'omdb';
  sourceLabel: string;
  year?: number;
}

/**
 * Searches AniList for anime cover posters
 */
async function searchAniListPosters(query: string): Promise<WebPosterCandidate[]> {
  try {
    const results = await searchAniList(query);
    return results
      .filter((r) => r.posterUrl)
      .map((r) => ({
        id: `anilist-poster-${r.id}`,
        url: r.posterUrl!,
        title: r.title,
        source: 'anilist' as const,
        sourceLabel: 'AniList HD Anime Artwork',
        year: r.year,
      }));
  } catch {
    return [];
  }
}

/**
 * Searches Cinemeta / IMDb for movie & show posters
 */
async function searchCinemetaPosters(query: string): Promise<WebPosterCandidate[]> {
  try {
    const results = await searchCinemeta(query);
    return results
      .filter((r) => r.posterUrl)
      .map((r) => ({
        id: `cinemeta-poster-${r.id}`,
        url: r.posterUrl!,
        title: r.title,
        source: 'cinemeta' as const,
        sourceLabel: 'IMDb / Cinemeta Poster',
        year: r.year,
      }));
  } catch {
    return [];
  }
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
 * Aggregates high-res poster candidates across AniList, Cinemeta, TMDB, iTunes, Wikipedia, and TVMaze.
 */
export async function fetchPosterCandidates(
  query: string,
  preferredType?: ContentType
): Promise<WebPosterCandidate[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  let tmdbKey = '';
  try {
    tmdbKey = useMovieStore.getState().settings?.tmdbApiKey || '';
  } catch {}

  try {
    const promises: Promise<WebPosterCandidate[]>[] = [
      searchCinemetaPosters(trimmed),
      searchAniListPosters(trimmed),
      searchITunesPosters(trimmed),
      searchWikipediaPosters(trimmed),
      preferredType === 'movie' ? Promise.resolve([]) : searchTVMazePosters(trimmed),
    ];

    if (tmdbKey) {
      promises.push(
        searchTMDB(trimmed, tmdbKey, preferredType).then((res) =>
          res
            .filter((r) => r.posterUrl)
            .map((r) => ({
              id: `tmdb-poster-${r.id}`,
              url: r.posterUrl!,
              title: r.title,
              source: 'tmdb' as const,
              sourceLabel: 'TMDB Official Poster',
              year: r.year,
            }))
        )
      );
    }

    const posterArrays = await Promise.all(promises);
    const all = posterArrays.flat();
    const seenUrls = new Set<string>();
    const unique: WebPosterCandidate[] = [];

    for (const item of all) {
      if (item.url && !seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        unique.push(item);
      }
    }

    return unique.slice(0, 12);
  } catch (err) {
    console.error('fetchPosterCandidates failed:', err);
    return [];
  }
}

/**
 * Main Smart Fetch Search API: Queries multi-source knowledge bases,
 * ranks and deduplicates, and returns rich movie metadata.
 * Supported sources: AniList GraphQL, Cinemeta (IMDb), TVMaze, iTunes, Wikipedia/Wikidata,
 * plus user-configured TMDB and OMDb API keys.
 */
export async function smartFetchMovieMetadata(
  query: string,
  preferredType?: ContentType
): Promise<SmartFetchMovieResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Safely check stored API keys from Zustand store
  let tmdbKey = '';
  let omdbKey = '';
  try {
    const settings = useMovieStore.getState().settings;
    tmdbKey = settings?.tmdbApiKey || '';
    omdbKey = settings?.omdbApiKey || '';
  } catch {}

  // If user explicitly selected anime, search AniList first with Jikan fallback
  if (preferredType === 'anime') {
    const aniResults = await searchAniList(trimmed);
    if (aniResults.length > 0) {
      return aniResults.slice(0, 6);
    }
    const jikanResults = await searchJikan(trimmed);
    if (jikanResults.length > 0) {
      return jikanResults.slice(0, 6);
    }
  }

  // Run multi-source parallel fetch
  const searchPromises: Promise<SmartFetchMovieResult[]>[] = [
    // 1. AniList for anime matches (zero key needed)
    searchAniList(trimmed),
    // 2. Cinemeta for recent movies & TV series (zero key needed, open IMDb data)
    searchCinemeta(trimmed, preferredType),
    // 3. TVMaze for TV & streaming series (zero key needed)
    preferredType === 'movie' ? Promise.resolve([]) : searchTVMaze(trimmed),
    // 4. iTunes media database (zero key needed)
    preferredType === 'series' ? Promise.resolve([]) : searchITunes(trimmed),
    // 5. Wikipedia cinema database (zero key needed)
    searchWikipedia(trimmed),
  ];

  // 6. TMDB API if user configured API key
  if (tmdbKey) {
    searchPromises.push(searchTMDB(trimmed, tmdbKey, preferredType));
  }

  // 7. OMDb API if user configured API key
  if (omdbKey) {
    searchPromises.push(searchOMDb(trimmed, omdbKey, preferredType));
  }

  const resultsBySource = await Promise.all(searchPromises);
  const allResults = resultsBySource.flat();

  // Deduplicate and rank results
  const seen = new Set<string>();
  const uniqueResults: SmartFetchMovieResult[] = [];

  // Ranking strategy:
  // 1. Boost results that have a posterUrl
  // 2. Boost results matching preferredType
  // 3. Consider source confidence
  allResults.sort((a, b) => {
    // Has poster prioritized
    if (a.posterUrl && !b.posterUrl) return -1;
    if (!a.posterUrl && b.posterUrl) return 1;

    // Preferred type match priority
    if (preferredType) {
      if (a.contentType === preferredType && b.contentType !== preferredType) return -1;
      if (b.contentType === preferredType && a.contentType !== preferredType) return 1;
    }

    return b.confidence - a.confidence;
  });

  for (const item of allResults) {
    const key = `${item.cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}-${item.year || ''}-${item.contentType}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(item);
    }
  }

  return uniqueResults.slice(0, 7);
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

