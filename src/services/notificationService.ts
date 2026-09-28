import { Movie, NotificationPreferences } from '../types/movie';

const NOTIFICATIONS_SENT_KEY = 'movielist_notifications_sent';

function getSentNotifications(): Record<string, number> {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_SENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function markNotificationSent(key: string): void {
  try {
    const sent = getSentNotifications();
    sent[key] = Date.now();
    localStorage.setItem(NOTIFICATIONS_SENT_KEY, JSON.stringify(sent));
  } catch (err) {
    console.error('Error recording sent notification:', err);
  }
}

function isNotificationSent(key: string): boolean {
  const sent = getSentNotifications();
  return Boolean(sent[key]);
}

export function isWithinQuietHours(start: string, end: string): boolean {
  if (!start || !end) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    // e.g. 01:00 to 06:00
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight: e.g. 23:00 to 07:00
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
}

export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions,
  prefs?: NotificationPreferences
): boolean {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  if (prefs) {
    if (!prefs.enabled) return false;
    if (prefs.quietHoursEnabled && isWithinQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd)) {
      console.log('Skipping notification during quiet hours:', title);
      return false;
    }
  }

  try {
    const n = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
    return true;
  } catch (err) {
    console.error('Failed to dispatch notification:', err);
    return false;
  }
}

export interface CheckReleasesResult {
  newlyReleasedMovies: Movie[];
  upcomingReminders: Array<{ movie: Movie; type: '1day' | '3day' }>;
}

export async function checkMovieReleases(
  movies: Movie[],
  prefs: NotificationPreferences,
  onUpdateMovie: (id: string, updates: Partial<Movie>) => Promise<void>
): Promise<CheckReleasesResult> {
  const newlyReleased: Movie[] = [];
  const upcomingReminders: Array<{ movie: Movie; type: '1day' | '3day' }> = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const movie of movies) {
    if (!movie.releaseDate) continue;

    const releaseDate = new Date(movie.releaseDate);
    releaseDate.setHours(0, 0, 0, 0);

    const diffTime = releaseDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Case 1: Was unreleased, but releaseDate <= today
    if (!movie.isReleased && diffDays <= 0) {
      // Mark as released
      await onUpdateMovie(movie.id, { isReleased: true });
      newlyReleased.push({ ...movie, isReleased: true });

      const notifKey = `released_${movie.id}_${movie.releaseDate}`;
      if (!isNotificationSent(notifKey)) {
        if (prefs.enabled && prefs.notifyOnReleaseDay) {
          const platform = movie.platforms[0] || 'theatres';
          sendBrowserNotification(
            `🎬 ${movie.title} is now streaming!`,
            {
              body: `Available now on ${platform}. Add to your weekend watchlist!`,
              tag: notifKey,
            },
            prefs
          );
        }
        markNotificationSent(notifKey);
      }
    }

    // Case 2: Future releases with notification enabled
    if (movie.notifyOnRelease && diffDays > 0) {
      // 1 day before
      if (diffDays === 1 && prefs.notifyOneDayBefore) {
        const notifKey = `1day_${movie.id}_${movie.releaseDate}`;
        if (!isNotificationSent(notifKey)) {
          if (prefs.enabled) {
            sendBrowserNotification(
              `⏰ Tomorrow: ${movie.title} releases!`,
              {
                body: `Get ready! Streaming tomorrow on ${movie.platforms.join(', ')}.`,
                tag: notifKey,
              },
              prefs
            );
          }
          markNotificationSent(notifKey);
          upcomingReminders.push({ movie, type: '1day' });
        }
      }

      // 3 days before
      if (diffDays === 3 && prefs.notifyThreeDaysBefore) {
        const notifKey = `3day_${movie.id}_${movie.releaseDate}`;
        if (!isNotificationSent(notifKey)) {
          if (prefs.enabled) {
            sendBrowserNotification(
              `🔔 3 Days Left: ${movie.title}`,
              {
                body: `Releasing soon on ${movie.platforms.join(', ')}.`,
                tag: notifKey,
              },
              prefs
            );
          }
          markNotificationSent(notifKey);
          upcomingReminders.push({ movie, type: '3day' });
        }
      }
    }
  }

  // Update last check time
  localStorage.setItem('movielist_last_checked_releases', new Date().toISOString());

  return {
    newlyReleasedMovies: newlyReleased,
    upcomingReminders,
  };
}

export async function triggerTestNotification(
  prefs?: NotificationPreferences
): Promise<{ success: boolean; message: string }> {
  if (!('Notification' in window)) {
    return {
      success: false,
      message: 'Browser notifications are not supported in this browser.',
    };
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return {
      success: false,
      message: 'Notification permission was denied. Please allow notifications in your browser settings.',
    };
  }

  const sent = sendBrowserNotification(
    '🎬 Movielist Premiere Alert',
    {
      body: '🔔 Test notification successful! You will be alerted when upcoming watchlist films premiere.',
      tag: `movielist_test_${Date.now()}`,
    },
    // Don't block manual test notification by quiet hours
    prefs ? { ...prefs, quietHoursEnabled: false } : undefined
  );

  if (sent) {
    return {
      success: true,
      message: 'Test notification delivered to your system! 🎬',
    };
  } else {
    return {
      success: false,
      message: 'Could not deliver notification. Please check system permissions.',
    };
  }
}
