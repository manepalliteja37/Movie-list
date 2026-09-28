/**
 * Analytics Service
 * Privacy-first lightweight analytics tracker with full user consent control.
 * Zero third-party data selling; tracks anonymous usage events locally.
 */

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  label?: string;
  page?: string;
}

const STORAGE_KEY_CONSENT = 'movielist_cookie_consent';
const STORAGE_KEY_EVENTS = 'movielist_analytics_events';

export function getCookieConsent(): { accepted: boolean; timestamp?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONSENT);
    if (!raw) return { accepted: false };
    return JSON.parse(raw);
  } catch {
    return { accepted: false };
  }
}

export function setCookieConsent(accepted: boolean): void {
  try {
    localStorage.setItem(
      STORAGE_KEY_CONSENT,
      JSON.stringify({ accepted, timestamp: new Date().toISOString() })
    );
  } catch {
    // Fail silently
  }
}

export function trackPageView(pageName: string): void {
  const consent = getCookieConsent();
  if (!consent.accepted) return;

  trackEvent('Navigation', 'PageView', pageName, pageName);
}

export function trackEvent(
  category: string,
  action: string,
  label?: string,
  page?: string
): void {
  const consent = getCookieConsent();
  if (!consent.accepted) return;

  const event: AnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    category,
    action,
    label,
    page: page || window.location.pathname,
  };

  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_EVENTS);
    const events: AnalyticsEvent[] = existingRaw ? JSON.parse(existingRaw) : [];
    // Keep maximum 200 events log locally
    events.unshift(event);
    if (events.length > 200) events.pop();
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch {
    // Fail silently
  }
}
