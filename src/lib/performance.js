export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit = 100) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function memoize(func) {
  const cache = new Map();
  return function memoized(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

export function lazyLoad(importFunc) {
  return React.lazy(importFunc);
}

export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(srcs) {
  return Promise.all(srcs.map(preloadImage));
}

export function prefetchRoute(route) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
}

export function measurePerformance(name, func) {
  const start = performance.now();
  const result = func();
  const end = performance.now();
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  return result;
}

export async function measureAsyncPerformance(name, func) {
  const start = performance.now();
  const result = await func();
  const end = performance.now();
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  return result;
}

export function getWebVitals() {
  return new Promise((resolve) => {
    const vitals = {};

    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            vitals.LCP = entry.renderTime || entry.loadTime;
          }
          if (entry.entryType === 'first-input') {
            vitals.FID = entry.processingStart - entry.startTime;
          }
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            vitals.CLS = (vitals.CLS || 0) + entry.value;
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      setTimeout(() => {
        observer.disconnect();
        resolve(vitals);
      }, 5000);
    } else {
      resolve(vitals);
    }
  });
}

export function optimizeImages(img) {
  if (!img.loading) {
    img.loading = 'lazy';
  }
  
  if (!img.decoding) {
    img.decoding = 'async';
  }

  if (img.naturalWidth > 1920) {
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
  }
}

export function enableVirtualScrolling(container, items, itemHeight, renderItem) {
  const visibleCount = Math.ceil(container.clientHeight / itemHeight);
  const buffer = 5;
  let scrollTop = 0;

  const render = () => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(items.length, startIndex + visibleCount + buffer * 2);

    container.innerHTML = '';
    container.style.height = `${items.length * itemHeight}px`;
    container.style.position = 'relative';

    for (let i = startIndex; i < endIndex; i++) {
      const element = renderItem(items[i], i);
      element.style.position = 'absolute';
      element.style.top = `${i * itemHeight}px`;
      element.style.height = `${itemHeight}px`;
      container.appendChild(element);
    }
  };

  const handleScroll = throttle(() => {
    scrollTop = container.scrollTop;
    render();
  }, 16);

  container.addEventListener('scroll', handleScroll);
  render();

  return () => {
    container.removeEventListener('scroll', handleScroll);
  };
}

export function batchUpdates(updates) {
  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
}

export function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function cacheData(key, data, ttl = 3600000) {
  const item = {
    data,
    timestamp: Date.now(),
    ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getCachedData(key) {
  const item = localStorage.getItem(key);
  if (!item) return null;

  const { data, timestamp, ttl } = JSON.parse(item);
  if (Date.now() - timestamp > ttl) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
}

export function clearExpiredCache() {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    try {
      const item = JSON.parse(localStorage.getItem(key));
      if (item.timestamp && item.ttl) {
        if (Date.now() - item.timestamp > item.ttl) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      // Not a cached item
    }
  });
}

export const performanceUtils = {
  debounce,
  throttle,
  memoize,
  lazyLoad,
  preloadImage,
  preloadImages,
  prefetchRoute,
  measurePerformance,
  measureAsyncPerformance,
  getWebVitals,
  optimizeImages,
  enableVirtualScrolling,
  batchUpdates,
  compressImage,
  cacheData,
  getCachedData,
  clearExpiredCache,
};
