export function useAnalytics() {
  const trackEvent = (eventName, properties = {}) => {
    // Placeholder analytics tracking
    console.log('Analytics event:', eventName, properties);
  };

  return { trackEvent };
}
