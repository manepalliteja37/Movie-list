export type ContentType = 'movie' | 'series' | 'anime' | 'shortfilm' | 'shortseries';

export type MovieStatus = 'watchlist' | 'watched';

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  contentType: ContentType;
  genres: string[];
  languages: string[];
  platforms: string[]; // Netflix, Prime, Theatre, YouTube, etc.
  releaseDate?: string; // ISO date
  isReleased: boolean;
  notifyOnRelease?: boolean;
  synopsis: string;
  posterUrl?: string;
  trailerUrl?: string;
  rating?: number; // user's rating 1-10
  status: MovieStatus;
  watchedDate?: string;
  watchedPlatform?: string;
  shareCaption?: string;
  addedAt: string;
  notes?: string;
  recommendedBy?: string; // who told you about this (e.g., YouTube review, Google search, friend)
}

export type SortOption = 'recent' | 'recentWatched' | 'releaseDate' | 'alphabetical' | 'rating';

export interface MovieFilters {
  type: 'all' | ContentType;
  genres: string[];
  platforms: string[];
  languages: string[];
  upcomingOnly: boolean;
  search: string;
  sortBy: SortOption;
}

export interface NotificationPreferences {
  enabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g., "23:00"
  quietHoursEnd: string; // e.g., "07:00"
  notifyOnReleaseDay: boolean;
  notifyThreeDaysBefore: boolean;
  notifyOneDayBefore: boolean;
}

export interface ReleaseAlert {
  id: string;
  movieId: string;
  title: string;
  platform: string;
  releaseDate: string;
  dismissed?: boolean;
}

export interface ShareHistoryItem {
  id: string;
  movieId?: string;
  movieTitle: string;
  type: 'single' | 'collection';
  sharedAt: string;
  itemCount?: number;
}

export type ThemeOption = 'theatre-dark' | 'cinema-light' | 'midnight-blue' | 'warm-red';
export type FontSizeOption = 'small' | 'medium' | 'large';

export interface AppSettings {
  userName: string;
  notificationsEnabled: boolean;
  notifications: NotificationPreferences;
  theme: ThemeOption;
  fontSize: FontSizeOption;
  reduceAnimations: boolean;
  onboardingCompleted: boolean;
  preferTeluguDisplay: boolean;
  shareHistory: ShareHistoryItem[];
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  movie: 'Movie',
  series: 'Series',
  anime: 'Anime',
  shortfilm: 'Short Film',
  shortseries: 'Short Series',
};

export const COMMON_GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Thriller',
  'Sci-Fi',
  'Horror',
  'Romance',
  'Documentary',
  'Animation',
  'Fantasy',
  'Mystery',
  'Crime',
  'Adventure',
  'Biography',
  'Family',
  'Love Story',
  'Musical',
  'War',
  'Western',
  'Sports',
  'Telugu Cinema',
];

export const COMMON_PLATFORMS = [
  'Netflix',
  'Prime Video',
  'Disney+',
  'Hotstar',
  'Aha',
  'Zee5',
  'Sun NXT',
  'YouTube',
  'Theatre',
  'Other',
];

export const COMMON_LANGUAGES = [
  'Telugu',
  'Hindi',
  'English',
  'Tamil',
  'Malayalam',
  'Kannada',
  'Japanese',
  'Korean',
  'Spanish',
  'French',
];
