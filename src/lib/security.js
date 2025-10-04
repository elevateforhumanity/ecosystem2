export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    valid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      minLength: password.length < minLength,
      hasUpperCase: !hasUpperCase,
      hasLowerCase: !hasLowerCase,
      hasNumbers: !hasNumbers,
      hasSpecialChar: !hasSpecialChar,
    },
  };
}

export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token, storedToken) {
  return token === storedToken;
}

export function hashPassword(password) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)).then((hash) => {
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  });
}

export function preventXSS(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function preventSQLInjection(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

export function rateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const storageKey = `rateLimit_${key}`;
  
  let requests = JSON.parse(localStorage.getItem(storageKey) || '[]');
  requests = requests.filter((timestamp) => now - timestamp < windowMs);
  
  if (requests.length >= maxRequests) {
    return {
      allowed: false,
      retryAfter: windowMs - (now - requests[0]),
    };
  }
  
  requests.push(now);
  localStorage.setItem(storageKey, JSON.stringify(requests));
  
  return {
    allowed: true,
    remaining: maxRequests - requests.length,
  };
}

export function secureStorage() {
  return {
    setItem: (key, value) => {
      try {
        const encrypted = btoa(JSON.stringify(value));
        sessionStorage.setItem(key, encrypted);
      } catch (error) {
        console.error('Failed to store item:', error);
      }
    },
    getItem: (key) => {
      try {
        const encrypted = sessionStorage.getItem(key);
        if (!encrypted) return null;
        return JSON.parse(atob(encrypted));
      } catch (error) {
        console.error('Failed to retrieve item:', error);
        return null;
      }
    },
    removeItem: (key) => {
      sessionStorage.removeItem(key);
    },
    clear: () => {
      sessionStorage.clear();
    },
  };
}

export function validateURL(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export function checkPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return {
    score: strength,
    level: levels[Math.min(strength, 5)],
    percentage: (strength / 6) * 100,
  };
}

export function detectSuspiciousActivity(events) {
  const suspiciousPatterns = {
    rapidRequests: events.filter((e) => e.type === 'request').length > 100,
    multipleFailedLogins: events.filter((e) => e.type === 'login' && !e.success).length > 5,
    unusualLocation: events.some((e) => e.location && e.location !== 'expected'),
    suspiciousUserAgent: events.some((e) => e.userAgent && /bot|crawler|spider/i.test(e.userAgent)),
  };
  
  return {
    suspicious: Object.values(suspiciousPatterns).some(Boolean),
    patterns: suspiciousPatterns,
  };
}

export const securityUtils = {
  sanitizeHTML,
  escapeHTML,
  validateEmail,
  validatePassword,
  generateCSRFToken,
  validateCSRFToken,
  hashPassword,
  preventXSS,
  preventSQLInjection,
  rateLimit,
  secureStorage,
  validateURL,
  sanitizeFilename,
  checkPasswordStrength,
  detectSuspiciousActivity,
};
