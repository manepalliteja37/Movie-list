import { nanoid } from 'nanoid';
import { Movie, NotificationPreferences, ReleaseAlert } from '../types/movie';

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
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
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
      icon: '/favicon.svg',
      badge: '/favicon.svg',
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
  upcomingReminders: Array<{ movie: Movie; type: '7day' | '3day' | '1day' }>;
  ottReminders: Array<{ movie: Movie; type: 'ott_reminder' | 'ott_review' | 'ott_recommend' }>;
  generatedAlerts: ReleaseAlert[];
}

/**
 * Checks all movies for premiere countdowns (7 days, 3 days, release day)
 * and OTT watchlist follow-ups ("did you watch it?", "how was it?", "did you recommend to friend?")
 * using movie-lover slang.
 */
export async function checkMovieReleases(
  movies: Movie[],
  prefs: NotificationPreferences,
  onUpdateMovie: (id: string, updates: Partial<Movie>) => Promise<void>
): Promise<CheckReleasesResult> {
  const newlyReleased: Movie[] = [];
  const upcomingReminders: Array<{ movie: Movie; type: '7day' | '3day' | '1day' }> = [];
  const ottReminders: Array<{ movie: Movie; type: 'ott_reminder' | 'ott_review' | 'ott_recommend' }> = [];
  const generatedAlerts: ReleaseAlert[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const movie of movies) {
    const platform = movie.platforms[0] || 'Theatre / OTT';
    const isTheatrical =
      movie.platforms.includes('Theatre') ||
      !movie.platforms.some((p) =>
        ['Netflix', 'Prime Video', 'Disney+', 'Hotstar', 'Aha', 'Zee5', 'Sun NXT', 'YouTube'].includes(p)
      );

    // =========================================================================
    // PART 1: UNRELEASED / UPCOMING MOVIES (7 Days, 3 Days, Release Day)
    // =========================================================================
    if (movie.releaseDate) {
      const releaseDate = new Date(movie.releaseDate);
      releaseDate.setHours(0, 0, 0, 0);

      const diffTime = releaseDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // Case 1A: Reached release day or past release date, was marked unreleased
      if (!movie.isReleased && diffDays <= 0) {
        await onUpdateMovie(movie.id, { isReleased: true });
        newlyReleased.push({ ...movie, isReleased: true });

        const notifKey = `released_${movie.id}_${movie.releaseDate}`;
        if (!isNotificationSent(notifKey)) {
          if (prefs.enabled && prefs.notifyOnReleaseDay) {
            const titleText = isTheatrical
              ? `🎬 Showtime: Go watch ${movie.title} in nearby theatres!`
              : `🎬 Now Streaming: ${movie.title} is now out on ${platform}!`;

            const bodyText = isTheatrical
              ? `First Day First Show (FDFS) vibes! ${movie.title} is now playing on the big screen near you — grab your popcorn and go watch it!`
              : `Hit play on ${platform} and enjoy the cinema magic from your couch tonight!`;

            sendBrowserNotification(
              titleText,
              {
                body: bodyText,
                tag: notifKey,
              },
              prefs
            );
          }
          markNotificationSent(notifKey);
        }

        generatedAlerts.push({
          id: nanoid(),
          movieId: movie.id,
          title: movie.title,
          platform: isTheatrical ? 'Theatres' : platform,
          releaseDate: movie.releaseDate,
          type: 'release',
          headline: `GO WATCH ${movie.title.toUpperCase()} IN NEARBY THEATRES!`,
          message: 'Now playing! First Day First Show energy — grab your popcorn and experience the big-screen spectacle!',
          actionType: 'view',
        });
      }

      // Case 1B: Future releases with notification enabled
      if (movie.notifyOnRelease && diffDays > 0) {
        // 7 Days Before: "Did you plan to watch movie?"
        if (diffDays === 7 && prefs.notifySevenDaysBefore) {
          const notifKey = `7day_${movie.id}_${movie.releaseDate}`;
          if (!isNotificationSent(notifKey)) {
            if (prefs.enabled) {
              sendBrowserNotification(
                `🎟️ 7 Days to Go: Did you plan to watch ${movie.title}?`,
                {
                  body: `${movie.title} premieres in 7 days! Gather your movie gang or clear your schedule for premiere week!`,
                  tag: notifKey,
                },
                prefs
              );
            }
            markNotificationSent(notifKey);
            upcomingReminders.push({ movie, type: '7day' });

            generatedAlerts.push({
              id: nanoid(),
              movieId: movie.id,
              title: movie.title,
              platform: isTheatrical ? 'Theatres' : platform,
              releaseDate: movie.releaseDate,
              type: '7day',
              headline: `DID YOU PLAN TO WATCH ${movie.title.toUpperCase()}?`,
              message: 'Premieres in 7 days! Gather your film gang or clear your weekend schedule for premiere week.',
              actionType: 'view',
            });
          }
        }

        // 3 Days Before: "Did you buy a ticket?"
        if (diffDays === 3 && prefs.notifyThreeDaysBefore) {
          const notifKey = `3day_${movie.id}_${movie.releaseDate}`;
          if (!isNotificationSent(notifKey)) {
            if (prefs.enabled) {
              sendBrowserNotification(
                `🍿 3 Days Left: Did you buy a ticket for ${movie.title}?`,
                {
                  body: `Advance bookings are open! Grab your favourite seats before housefull signs go up!`,
                  tag: notifKey,
                },
                prefs
              );
            }
            markNotificationSent(notifKey);
            upcomingReminders.push({ movie, type: '3day' });

            generatedAlerts.push({
              id: nanoid(),
              movieId: movie.id,
              title: movie.title,
              platform: isTheatrical ? 'Theatres' : platform,
              releaseDate: movie.releaseDate,
              type: '3day',
              headline: `DID YOU BUY A TICKET FOR ${movie.title.toUpperCase()}?`,
              message: '3 days left! Advance bookings are live — grab the best seats before housefull signs go up.',
              actionType: 'view',
            });
          }
        }

        // 1 Day Before: Tomorrow release reminder
        if (diffDays === 1 && prefs.notifyOneDayBefore) {
          const notifKey = `1day_${movie.id}_${movie.releaseDate}`;
          if (!isNotificationSent(notifKey)) {
            if (prefs.enabled) {
              sendBrowserNotification(
                `⏰ Tomorrow: ${movie.title} hits screens!`,
                {
                  body: `First Day First Show hype! Get your tickets ready for tomorrow's premiere.`,
                  tag: notifKey,
                },
                prefs
              );
            }
            markNotificationSent(notifKey);
            upcomingReminders.push({ movie, type: '1day' });
          }
        }
      }
    }

    // =========================================================================
    // PART 2: RELEASED / OTT MOVIES IN WATCHLIST (Check-in & Follow-up Reminders)
    // "did you watch it yet?", "how was it?", "did you recommend to friend?"
    // =========================================================================
    if (movie.isReleased && prefs.enabled && prefs.notifyOttWatchlistReminders) {
      const addedTime = movie.addedAt ? new Date(movie.addedAt).getTime() : 0;
      const daysSinceAdded = addedTime > 0 ? Math.round((today.getTime() - addedTime) / (1000 * 60 * 60 * 24)) : 0;

      // Check-in 1: 2-3 Days after adding to Watchlist: "Did you watch it yet?"
      if (movie.status === 'watchlist' && daysSinceAdded >= 2 && daysSinceAdded <= 4) {
        const notifKey = `ott_watch_${movie.id}`;
        if (!isNotificationSent(notifKey)) {
          sendBrowserNotification(
            `🍿 Watchlist Check-In: Did you watch ${movie.title}?`,
            {
              body: `You added ${movie.title} to your watchlist — it's available now on ${platform}! Settle in with popcorn tonight.`,
              tag: notifKey,
            },
            prefs
          );
          markNotificationSent(notifKey);
          ottReminders.push({ movie, type: 'ott_reminder' });

          generatedAlerts.push({
            id: nanoid(),
            movieId: movie.id,
            title: movie.title,
            platform,
            releaseDate: movie.releaseDate || '',
            type: 'ott_reminder',
            headline: `DID YOU WATCH ${movie.title.toUpperCase()} YET?`,
            message: `You added this film to your watchlist. Streaming now on ${platform} — watch it tonight!`,
            actionType: 'watch',
          });
        }
      }

      // Check-in 2: 5-7 Days after adding to Watchlist: "Did you watch, how was it?"
      if (movie.status === 'watchlist' && daysSinceAdded >= 5 && daysSinceAdded <= 8) {
        const notifKey = `ott_review_${movie.id}`;
        if (!isNotificationSent(notifKey)) {
          sendBrowserNotification(
            `⭐ Cinephile Check-In: Watched ${movie.title}? How was it?`,
            {
              body: `Did you watch ${movie.title}? How was it? Rate it out of 10 and log your cinephile review on Movielist!`,
              tag: notifKey,
            },
            prefs
          );
          markNotificationSent(notifKey);
          ottReminders.push({ movie, type: 'ott_review' });

          generatedAlerts.push({
            id: nanoid(),
            movieId: movie.id,
            title: movie.title,
            platform,
            releaseDate: movie.releaseDate || '',
            type: 'ott_review',
            headline: `WATCHED ${movie.title.toUpperCase()}? HOW WAS IT?`,
            message: 'Did it meet the hype? Rate it out of 10, drop your review, and mark as watched!',
            actionType: 'watch',
          });
        }
      }

      // Check-in 3: After watching (status === 'watched'): "Did you recommend to your friend?"
      if (movie.status === 'watched') {
        const watchedDateStr = movie.watchedDate || movie.addedAt;
        const watchedTime = watchedDateStr ? new Date(watchedDateStr).getTime() : 0;
        const daysSinceWatched = watchedTime > 0 ? Math.round((today.getTime() - watchedTime) / (1000 * 60 * 60 * 24)) : 0;

        if (daysSinceWatched >= 0 && daysSinceWatched <= 3) {
          const notifKey = `ott_recommend_${movie.id}`;
          if (!isNotificationSent(notifKey)) {
            sendBrowserNotification(
              `🎟️ Watched ${movie.title}? Did you recommend it to your friend?`,
              {
                body: `Loved ${movie.title}? Share your personalized cinematic ticket pass with your friends or film circle!`,
                tag: notifKey,
              },
              prefs
            );
            markNotificationSent(notifKey);
            ottReminders.push({ movie, type: 'ott_recommend' });

            generatedAlerts.push({
              id: nanoid(),
              movieId: movie.id,
              title: movie.title,
              platform,
              releaseDate: movie.releaseDate || '',
              type: 'ott_recommend',
              headline: `DID YOU RECOMMEND ${movie.title.toUpperCase()} TO YOUR FRIEND?`,
              message: 'Finished watching? Generate and share your personalized collectible ticket pass with friends!',
              actionType: 'share',
            });
          }
        }
      }
    }
  }

  localStorage.setItem('movielist_last_checked_releases', new Date().toISOString());

  return {
    newlyReleasedMovies: newlyReleased,
    upcomingReminders,
    ottReminders,
    generatedAlerts,
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
    '🍿 3 Days Left: Did you buy a ticket for Kalki 2898 AD?',
    {
      body: '🎟️ Advance bookings are open! Or did you plan to watch the movie this weekend? First Day First Show vibes!',
      tag: `movielist_test_${Date.now()}`,
    },
    // Don't block manual test notification by quiet hours
    prefs ? { ...prefs, quietHoursEnabled: false } : undefined
  );

  if (sent) {
    return {
      success: true,
      message: 'Test notification sent with movie lover slang! 🍿🎟️',
    };
  } else {
    return {
      success: false,
      message: 'Could not deliver notification. Please check system permissions.',
    };
  }
}
