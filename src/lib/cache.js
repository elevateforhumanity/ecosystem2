class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  set(key, value, ttl = 3600000) {
    const item = {
      value,
      expires: Date.now() + ttl,
      created: Date.now(),
    };

    this.memoryCache.set(key, item);
    this.cacheStats.sets++;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(item));
      } catch (error) {
        console.warn('Failed to cache to localStorage:', error);
      }
    }

    return value;
  }

  get(key) {
    let item = this.memoryCache.get(key);

    if (!item && typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          this.memoryCache.set(key, item);
        }
      } catch (error) {
        console.warn('Failed to retrieve from localStorage:', error);
      }
    }

    if (!item) {
      this.cacheStats.misses++;
      return null;
    }

    if (Date.now() > item.expires) {
      this.delete(key);
      this.cacheStats.misses++;
      return null;
    }

    this.cacheStats.hits++;
    return item.value;
  }

  delete(key) {
    this.memoryCache.delete(key);
    this.cacheStats.deletes++;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`cache_${key}`);
    }
  }

  clear() {
    this.memoryCache.clear();

    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    }

    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  has(key) {
    return this.get(key) !== null;
  }

  getStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = total > 0 ? (this.cacheStats.hits / total) * 100 : 0;

    return {
      ...this.cacheStats,
      size: this.memoryCache.size,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  cleanExpired() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expires) {
        this.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  async getOrFetch(key, fetchFn, ttl = 3600000) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }

  memoize(fn, keyGenerator, ttl = 3600000) {
    return async (...args) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      return this.getOrFetch(key, () => fn(...args), ttl);
    };
  }
}

export const cache = new CacheManager();

export function cacheMiddleware(ttl = 3600000) {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const cacheKey = `${propertyKey}_${JSON.stringify(args)}`;
      return cache.getOrFetch(cacheKey, () => originalMethod.apply(this, args), ttl);
    };

    return descriptor;
  };
}

export class QueryCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  set(query, params, result) {
    const key = this.generateKey(query, params);

    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });

    this.updateAccessOrder(key);
  }

  get(query, params) {
    const key = this.generateKey(query, params);
    const cached = this.cache.get(key);

    if (!cached) return null;

    this.updateAccessOrder(key);
    return cached.result;
  }

  generateKey(query, params) {
    return `${query}_${JSON.stringify(params)}`;
  }

  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  invalidate(pattern) {
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
          this.accessOrder.splice(index, 1);
        }
      }
    });
  }
}

export const queryCache = new QueryCache();

export function useCachedFetch(url, options = {}) {
  const { ttl = 300000, cacheKey } = options;
  const key = cacheKey || url;

  return cache.getOrFetch(
    key,
    async () => {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    ttl
  );
}

export function invalidateCache(pattern) {
  if (pattern === '*') {
    cache.clear();
    queryCache.clear();
  } else {
    const keys = Array.from(cache.memoryCache.keys());
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    });
    queryCache.invalidate(pattern);
  }
}

export function preloadCache(items) {
  items.forEach(({ key, value, ttl }) => {
    cache.set(key, value, ttl);
  });
}

setInterval(() => {
  cache.cleanExpired();
}, 60000);

export const cacheUtils = {
  cache,
  queryCache,
  cacheMiddleware,
  useCachedFetch,
  invalidateCache,
  preloadCache,
};
