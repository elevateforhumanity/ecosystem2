import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateContentType = (req: Request, _res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
      return next(new AppError('Invalid content type', 415));
    }
  }
  next();
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

export const preventParameterPollution = (req: Request, _res: Response, next: NextFunction) => {
  const cleanParams = (obj: any) => {
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key][obj[key].length - 1];
      }
    }
    return obj;
  };

  if (req.query) {
    req.query = cleanParams(req.query);
  }

  next();
};

export const csrfProtection = (req: Request, _res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.origin;
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');

    if (!origin || !allowedOrigins.includes(origin)) {
      if (process.env.NODE_ENV === 'production') {
        return next(new AppError('Invalid origin', 403));
      }
    }
  }
  next();
};

export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength) > maxSize) {
      return next(new AppError('Request entity too large', 413));
    }
    next();
  };
};

export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
};
