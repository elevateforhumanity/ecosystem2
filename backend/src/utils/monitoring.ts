import { Request, Response, NextFunction } from 'express';
import { logger } from '../middleware/logger';

interface PerformanceMetrics {
  requestCount: number;
  errorCount: number;
  totalResponseTime: number;
  averageResponseTime: number;
  slowestEndpoint: { url: string; duration: number } | null;
  fastestEndpoint: { url: string; duration: number } | null;
}

class MonitoringService {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
    slowestEndpoint: null,
    fastestEndpoint: null,
  };

  private endpointMetrics: Map<string, { count: number; totalTime: number }> = new Map();

  recordRequest(duration: number, url: string, statusCode: number) {
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += duration;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.requestCount;

    if (statusCode >= 400) {
      this.metrics.errorCount++;
    }

    if (!this.metrics.slowestEndpoint || duration > this.metrics.slowestEndpoint.duration) {
      this.metrics.slowestEndpoint = { url, duration };
    }

    if (!this.metrics.fastestEndpoint || duration < this.metrics.fastestEndpoint.duration) {
      this.metrics.fastestEndpoint = { url, duration };
    }

    const existing = this.endpointMetrics.get(url) || { count: 0, totalTime: 0 };
    this.endpointMetrics.set(url, {
      count: existing.count + 1,
      totalTime: existing.totalTime + duration,
    });
  }

  getMetrics(): PerformanceMetrics & { endpoints: Record<string, { count: number; avgTime: number }> } {
    const endpoints: Record<string, { count: number; avgTime: number }> = {};
    
    this.endpointMetrics.forEach((value, key) => {
      endpoints[key] = {
        count: value.count,
        avgTime: value.totalTime / value.count,
      };
    });

    return {
      ...this.metrics,
      endpoints,
    };
  }

  reset() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      slowestEndpoint: null,
      fastestEndpoint: null,
    };
    this.endpointMetrics.clear();
  }

  logMetrics() {
    logger.info('Performance Metrics', this.getMetrics());
  }
}

export const monitoring = new MonitoringService();

export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    monitoring.recordRequest(duration, req.url, res.statusCode);

    if (duration > 1000) {
      logger.warn('Slow request detected', {
        url: req.url,
        method: req.method,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};

setInterval(() => {
  monitoring.logMetrics();
}, 60000);

export const getHealthStatus = () => {
  const metrics = monitoring.getMetrics();
  const errorRate = metrics.requestCount > 0 ? (metrics.errorCount / metrics.requestCount) * 100 : 0;

  return {
    status: errorRate < 5 ? 'healthy' : errorRate < 10 ? 'degraded' : 'unhealthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    metrics: {
      requests: metrics.requestCount,
      errors: metrics.errorCount,
      errorRate: `${errorRate.toFixed(2)}%`,
      avgResponseTime: `${metrics.averageResponseTime.toFixed(2)}ms`,
    },
    timestamp: new Date().toISOString(),
  };
};
