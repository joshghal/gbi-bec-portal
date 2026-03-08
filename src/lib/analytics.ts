'use client';

import { getAnalytics, logEvent, isSupported, type Analytics } from 'firebase/analytics';
import app from './firebase';

let analytics: Analytics | null = null;

export async function initAnalytics() {
  if (typeof window === 'undefined') return null;
  if (analytics) return analytics;

  const supported = await isSupported();
  if (!supported) return null;

  analytics = getAnalytics(app);
  return analytics;
}

export function trackEvent(eventName: string, params?: Record<string, string | number>) {
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}

export function trackChatMessage(question: string) {
  trackEvent('chat_message', {
    question: question.slice(0, 100),
  });
}

export function trackPageView(pageName: string) {
  trackEvent('page_view', { page_title: pageName });
}
