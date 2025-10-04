class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.listeners = [];
  }

  log(level, message, data = {}) {
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    this.logs.push(logEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.notifyListeners(logEntry);

    if (level === 'error' || level === 'fatal') {
      this.sendToServer(logEntry);
    }

    const consoleMethod = console[level] || console.log;
    consoleMethod(`[${level.toUpperCase()}] ${message}`, data);
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  debug(message, data) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }

  fatal(message, data) {
    this.log('fatal', message, data);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notifyListeners(logEntry) {
    this.listeners.forEach((callback) => {
      try {
        callback(logEntry);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  async sendToServer(logEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  }

  getLogs(filter = {}) {
    let filtered = this.logs;

    if (filter.level) {
      filtered = filtered.filter((log) => log.level === filter.level);
    }

    if (filter.since) {
      filtered = filtered.filter((log) => new Date(log.timestamp) >= filter.since);
    }

    return filtered;
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  startMeasure(name) {
    const startTime = performance.now();
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, duration);
        return duration;
      },
    };
  }

  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name);
    metrics.push({
      value,
      timestamp: Date.now(),
    });

    if (metrics.length > 100) {
      metrics.shift();
    }

    logger.debug(`Performance: ${name}`, { duration: value.toFixed(2) + 'ms' });
  }

  getMetrics(name) {
    const metrics = this.metrics.get(name) || [];
    if (metrics.length === 0) return null;

    const values = metrics.map((m) => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      name,
      count: values.length,
      average: avg.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      latest: values[values.length - 1].toFixed(2),
    };
  }

  getAllMetrics() {
    const result = {};
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    return result;
  }

  observeWebVitals() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          this.recordMetric('LCP', entry.renderTime || entry.loadTime);
        }
        if (entry.entryType === 'first-input') {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          const currentCLS = this.metrics.get('CLS')?.[0]?.value || 0;
          this.recordMetric('CLS', currentCLS + entry.value);
        }
      }
    });

    try {
      observer.observe({
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'],
      });
      this.observers.push(observer);
    } catch (error) {
      logger.warn('Failed to observe web vitals', { error: error.message });
    }
  }

  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: 'Unhandled Promise Rejection',
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }

  trackError(error) {
    const errorEntry = {
      ...error,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    this.errors.push(errorEntry);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    logger.error('Error tracked', errorEntry);

    this.sendToServer(errorEntry);
  }

  async sendToServer(error) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });
    } catch (err) {
      console.error('Failed to send error to server:', err);
    }
  }

  getErrors(filter = {}) {
    let filtered = this.errors;

    if (filter.since) {
      filtered = filtered.filter((error) => new Date(error.timestamp) >= filter.since);
    }

    return filtered;
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();

class AnalyticsTracker {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    this.events.push(event);
    logger.debug('Event tracked', event);

    this.sendToServer(event);
  }

  async sendToServer(event) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  pageView(pageName, properties = {}) {
    this.track('page_view', {
      page: pageName,
      ...properties,
    });
  }

  userAction(action, properties = {}) {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  getEvents(filter = {}) {
    let filtered = this.events;

    if (filter.name) {
      filtered = filtered.filter((event) => event.name === filter.name);
    }

    if (filter.since) {
      filtered = filtered.filter((event) => new Date(event.timestamp) >= filter.since);
    }

    return filtered;
  }
}

export const analyticsTracker = new AnalyticsTracker();

export function initializeMonitoring() {
  performanceMonitor.observeWebVitals();

  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      performanceMonitor.recordMetric('page_load', loadTime);
      logger.info('Page loaded', { loadTime: loadTime.toFixed(2) + 'ms' });
    });
  }

  logger.info('Monitoring initialized', {
    sessionId: analyticsTracker.sessionId,
  });
}

export const monitoring = {
  logger,
  performanceMonitor,
  errorTracker,
  analyticsTracker,
  initializeMonitoring,
};
