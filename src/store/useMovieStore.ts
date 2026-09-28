import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Movie, MovieFilters, AppSettings, ReleaseAlert, ShareHistoryItem } from '../types/movie';
import {
  syncMovieToIndexedDB,
  deleteMovieFromIndexedDB,
  bulkSyncMoviesToIndexedDB,
  clearIndexedDBMovies,
  loadAllMoviesFromIndexedDB,
} from '../db/db';

interface MovieStore {
  movies: Movie[];
  filters: MovieFilters;
  settings: AppSettings;
  releaseAlerts: ReleaseAlert[];
  isDbLoaded: boolean;
  
  // Actions
  initDb: () => Promise<void>;
  addMovie: (movie: Omit<Movie, 'id' | 'addedAt'>) => Promise<Movie>;
  updateMovie: (id: string, updates: Partial<Movie>) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
  markAsWatched: (
    id: string,
    ratingOrOptions?: number | {
      rating?: number;
      notes?: string;
      watchedDate?: string;
      watchedPlatform?: string;
      shareCaption?: string;
    },
    notes?: string
  ) => Promise<void>;
  moveToWatchlist: (id: string) => Promise<void>;
  setRating: (id: string, rating: number) => Promise<void>;
  setFilters: (filters: Partial<MovieFilters>) => void;
  resetFilters: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addShareHistory: (item: Omit<ShareHistoryItem, 'id' | 'sharedAt'>) => void;
  clearShareHistory: () => void;
  addReleaseAlert: (alert: ReleaseAlert) => void;
  dismissReleaseAlert: (id: string) => void;
  dismissAllReleaseAlerts: () => void;
  loadSampleData: () => Promise<void>;
  importMovies: (imported: Movie[]) => Promise<number>;
  clearAll: () => Promise<void>;
}

const initialFilters: MovieFilters = {
  type: 'all',
  genres: [],
  platforms: [],
  languages: [],
  upcomingOnly: false,
  search: '',
  sortBy: 'recent',
};

const initialSettings: AppSettings = {
  userName: 'Cinephile',
  notificationsEnabled: true,
  notifications: {
    enabled: true,
    quietHoursEnabled: true,
    quietHoursStart: '23:00',
    quietHoursEnd: '07:00',
    notifyOnReleaseDay: true,
    notifyThreeDaysBefore: true,
    notifyOneDayBefore: true,
  },
  theme: 'theatre-dark',
  fontSize: 'medium',
  reduceAnimations: false,
  onboardingCompleted: false,
  preferTeluguDisplay: true,
  shareHistory: [],
};

export const sampleMovies: Movie[] = [
  {
    id: 'sample-1',
    title: 'Kalki 2898 AD',
    originalTitle: 'కల్కి 2898 ఏ.డీ',
    contentType: 'movie',
    genres: ['Sci-Fi', 'Action', 'Telugu Cinema'],
    languages: ['Telugu', 'Hindi', 'Tamil'],
    platforms: ['Prime Video', 'Netflix'],
    releaseDate: '2024-06-27',
    isReleased: true,
    notifyOnRelease: false,
    synopsis: 'A modern avatar of Vishnu descends to Earth to protect the world from evil forces in a dystopian post-apocalyptic future set in Kasi.',
    rating: 8,
    status: 'watchlist',
    addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Watch in 4K with Atmos audio. Recommended for VFX and Mahabharata world-building.',
    recommendedBy: 'YouTube review by Baradwaj Rangan',
  },
  {
    id: 'sample-2',
    title: 'Dune: Part Two',
    originalTitle: 'Dune: Part Two',
    contentType: 'movie',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    languages: ['English'],
    platforms: ['Hotstar', 'Other'],
    releaseDate: '2024-03-01',
    isReleased: true,
    notifyOnRelease: false,
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    rating: 9,
    status: 'watched',
    watchedDate: '2024-03-15',
    addedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    notes: 'Masterpiece cinematography and sound design by Hans Zimmer.',
    recommendedBy: 'Google Search best sci-fi 2024',
  },
  {
    id: 'sample-3',
    title: 'Severance (Season 2)',
    originalTitle: 'Severance',
    contentType: 'series',
    genres: ['Thriller', 'Sci-Fi', 'Mystery'],
    languages: ['English'],
    platforms: ['Other'],
    releaseDate: '2025-01-17',
    isReleased: true,
    notifyOnRelease: false,
    synopsis: 'Mark Scout leads a team at Lumon Industries, whose employees have undergone a surgical procedure which separates their memories.',
    rating: 9,
    status: 'watchlist',
    addedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: 'Cliffhanger from Season 1 was incredible, must binge over a weekend.',
    recommendedBy: 'YouTube video essay on corporate dystopias',
  },
  {
    id: 'sample-4',
    title: 'Attack on Titan: The Final Chapters',
    originalTitle: '進撃の巨人',
    contentType: 'anime',
    genres: ['Action', 'Fantasy', 'Animation'],
    languages: ['Japanese', 'English'],
    platforms: ['Netflix', 'Other'],
    releaseDate: '2023-11-04',
    isReleased: true,
    notifyOnRelease: false,
    synopsis: 'The fate of the world hangs in the balance as Eren unleashes the ultimate power of the Titans.',
    rating: 10,
    status: 'watched',
    watchedDate: '2024-01-20',
    addedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    notes: 'One of the greatest anime conclusions in modern television history.',
    recommendedBy: 'YouTube Anime Recs channel',
  }
];

export const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      movies: [],
      filters: initialFilters,
      settings: initialSettings,
      releaseAlerts: [],
      isDbLoaded: false,

      initDb: async () => {
        try {
          const dbMovies = await loadAllMoviesFromIndexedDB();
          if (dbMovies && dbMovies.length > 0) {
            set({ movies: dbMovies, isDbLoaded: true });
          } else {
            // If localStorage had movies but IndexedDB is fresh, sync them
            const currentMovies = get().movies;
            if (currentMovies.length > 0) {
              await bulkSyncMoviesToIndexedDB(currentMovies);
            }
            set({ isDbLoaded: true });
          }
        } catch (err) {
          console.error('Error initializing IndexedDB:', err);
          set({ isDbLoaded: true });
        }
      },

      addMovie: async (movieData) => {
        const newMovie: Movie = {
          ...movieData,
          id: nanoid(),
          addedAt: new Date().toISOString(),
        };

        set((state) => ({
          movies: [newMovie, ...state.movies],
        }));

        // Persist to IndexedDB via Dexie.js
        await syncMovieToIndexedDB(newMovie);

        return newMovie;
      },

      updateMovie: async (id, updates) => {
        let updatedMovie: Movie | undefined;
        set((state) => {
          const newMovies = state.movies.map((m) => {
            if (m.id === id) {
              updatedMovie = { ...m, ...updates };
              return updatedMovie;
            }
            return m;
          });
          return { movies: newMovies };
        });

        if (updatedMovie) {
          await syncMovieToIndexedDB(updatedMovie);
        }
      },

      deleteMovie: async (id) => {
        set((state) => ({
          movies: state.movies.filter((m) => m.id !== id),
        }));
        await deleteMovieFromIndexedDB(id);
      },

      markAsWatched: async (id, ratingOrOptions, notes) => {
        let updatedMovie: Movie | undefined;
        let rating: number | undefined;
        let finalNotes: string | undefined = notes;
        let watchedDate: string = new Date().toISOString().split('T')[0];
        let watchedPlatform: string | undefined;
        let shareCaption: string | undefined;

        if (typeof ratingOrOptions === 'object' && ratingOrOptions !== null) {
          rating = ratingOrOptions.rating;
          if (ratingOrOptions.notes !== undefined) finalNotes = ratingOrOptions.notes;
          if (ratingOrOptions.watchedDate) watchedDate = ratingOrOptions.watchedDate;
          watchedPlatform = ratingOrOptions.watchedPlatform;
          shareCaption = ratingOrOptions.shareCaption;
        } else if (typeof ratingOrOptions === 'number') {
          rating = ratingOrOptions;
        }

        set((state) => {
          const newMovies = state.movies.map((m) => {
            if (m.id === id) {
              updatedMovie = {
                ...m,
                status: 'watched' as const,
                watchedDate,
                ...(watchedPlatform ? { watchedPlatform } : {}),
                ...(shareCaption ? { shareCaption } : {}),
                ...(rating !== undefined ? { rating } : {}),
                ...(finalNotes !== undefined ? { notes: finalNotes } : {}),
              };
              return updatedMovie;
            }
            return m;
          });
          return { movies: newMovies };
        });

        if (updatedMovie) {
          await syncMovieToIndexedDB(updatedMovie);
        }
      },

      moveToWatchlist: async (id) => {
        let updatedMovie: Movie | undefined;
        set((state) => {
          const newMovies = state.movies.map((m) => {
            if (m.id === id) {
              updatedMovie = {
                ...m,
                status: 'watchlist' as const,
                watchedDate: undefined,
              };
              return updatedMovie;
            }
            return m;
          });
          return { movies: newMovies };
        });

        if (updatedMovie) {
          await syncMovieToIndexedDB(updatedMovie);
        }
      },

      setRating: async (id, rating) => {
        let updatedMovie: Movie | undefined;
        set((state) => {
          const newMovies = state.movies.map((m) => {
            if (m.id === id) {
              updatedMovie = { ...m, rating };
              return updatedMovie;
            }
            return m;
          });
          return { movies: newMovies };
        });

        if (updatedMovie) {
          await syncMovieToIndexedDB(updatedMovie);
        }
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      resetFilters: () => {
        set({ filters: initialFilters });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            notifications: {
              ...state.settings.notifications,
              ...(newSettings.notifications || {}),
            },
          },
        }));
      },

      addShareHistory: (item) => {
        set((state) => {
          const newItem: ShareHistoryItem = {
            id: nanoid(),
            ...item,
            sharedAt: new Date().toISOString(),
          };
          const existingHistory = state.settings.shareHistory || [];
          return {
            settings: {
              ...state.settings,
              shareHistory: [newItem, ...existingHistory].slice(0, 50),
            },
          };
        });
      },

      clearShareHistory: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            shareHistory: [],
          },
        }));
      },

      addReleaseAlert: (alert) => {
        set((state) => {
          // Avoid duplicate alerts for the same movie
          if (state.releaseAlerts.some((a) => a.movieId === alert.movieId)) {
            return state;
          }
          return { releaseAlerts: [alert, ...state.releaseAlerts] };
        });
      },

      dismissReleaseAlert: (id) => {
        set((state) => ({
          releaseAlerts: state.releaseAlerts.filter((a) => a.id !== id),
        }));
      },

      dismissAllReleaseAlerts: () => {
        set({ releaseAlerts: [] });
      },

      loadSampleData: async () => {
        set({ movies: sampleMovies });
        await bulkSyncMoviesToIndexedDB(sampleMovies);
      },

      importMovies: async (imported: Movie[]) => {
        if (!Array.isArray(imported) || imported.length === 0) return 0;
        
        let newCount = 0;
        let mergedList: Movie[] = [];

        set((state) => {
          const existingIds = new Set(state.movies.map((m) => m.id));
          const existingTitles = new Set(state.movies.map((m) => m.title.toLowerCase().trim()));

          const validItems: Movie[] = [];
          imported.forEach((m) => {
            if (!m || !m.title) return;
            const titleKey = m.title.toLowerCase().trim();
            if (existingTitles.has(titleKey)) return;

            const validMovie: Movie = {
              id: m.id || nanoid(),
              title: m.title,
              originalTitle: m.originalTitle,
              contentType: m.contentType || 'movie',
              genres: Array.isArray(m.genres) ? m.genres : ['Drama'],
              languages: Array.isArray(m.languages) ? m.languages : ['English'],
              platforms: Array.isArray(m.platforms) ? m.platforms : ['Theatre'],
              releaseDate: m.releaseDate,
              isReleased: m.isReleased !== undefined ? m.isReleased : true,
              notifyOnRelease: !!m.notifyOnRelease,
              synopsis: m.synopsis || '',
              posterUrl: m.posterUrl,
              trailerUrl: m.trailerUrl,
              rating: typeof m.rating === 'number' ? m.rating : undefined,
              status: m.status === 'watched' ? 'watched' : 'watchlist',
              watchedDate: m.watchedDate,
              watchedPlatform: m.watchedPlatform,
              shareCaption: m.shareCaption,
              addedAt: m.addedAt || new Date().toISOString(),
              notes: m.notes,
              recommendedBy: m.recommendedBy,
            };

            validItems.push(validMovie);
            existingTitles.add(titleKey);
          });

          newCount = validItems.length;
          mergedList = [...validItems, ...state.movies];
          return { movies: mergedList };
        });

        if (newCount > 0) {
          await bulkSyncMoviesToIndexedDB(mergedList);
        }

        return newCount;
      },

      clearAll: async () => {
        set({ movies: [] });
        await clearIndexedDBMovies();
      },
    }),
    {
      name: 'movielist-storage',
      partialize: (state) => ({
        movies: state.movies,
        settings: state.settings,
        filters: state.filters,
      }),
      merge: (persistedState, currentState) => {
        const pState = (persistedState as Partial<MovieStore>) || {};
        return {
          ...currentState,
          ...pState,
          settings: {
            ...initialSettings,
            ...(pState.settings || {}),
            theme: pState.settings?.theme || 'theatre-dark',
          },
        };
      },
    }
  )
);
