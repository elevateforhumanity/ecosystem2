import posthog from 'posthog-js';

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (key) {
    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true
    });
    initialized = true;
    console.log('Analytics initialized');
  }
}

export function trackEvent(name: string, properties?: Record<string, any>) {
  if (initialized) {
    posthog.capture(name, properties);
  }
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (initialized) {
    posthog.identify(userId, properties);
  }
}

export function resetUser() {
  if (initialized) {
    posthog.reset();
  }
}

export { posthog };
