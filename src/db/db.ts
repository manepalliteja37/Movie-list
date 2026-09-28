import Dexie, { type EntityTable } from 'dexie';
import { Movie } from '../types/movie';

export class MovieListDatabase extends Dexie {
  movies!: EntityTable<Movie, 'id'>;

  constructor() {
    super('MovielistDB');
    this.version(1).stores({
      movies: 'id, status, releaseDate, addedAt, title',
    });
  }
}

export const db = new MovieListDatabase();

// Helper functions for IndexedDB synchronization
export async function syncMovieToIndexedDB(movie: Movie): Promise<void> {
  try {
    await db.movies.put(movie);
  } catch (err) {
    console.error('Failed to save movie to IndexedDB:', err);
  }
}

export async function deleteMovieFromIndexedDB(id: string): Promise<void> {
  try {
    await db.movies.delete(id);
  } catch (err) {
    console.error('Failed to delete movie from IndexedDB:', err);
  }
}

export async function loadAllMoviesFromIndexedDB(): Promise<Movie[]> {
  try {
    return await db.movies.toArray();
  } catch (err) {
    console.error('Failed to load movies from IndexedDB:', err);
    return [];
  }
}

export async function bulkSyncMoviesToIndexedDB(movies: Movie[]): Promise<void> {
  try {
    await db.movies.bulkPut(movies);
  } catch (err) {
    console.error('Failed to bulk put movies in IndexedDB:', err);
  }
}

export async function clearIndexedDBMovies(): Promise<void> {
  try {
    await db.movies.clear();
  } catch (err) {
    console.error('Failed to clear movies in IndexedDB:', err);
  }
}
