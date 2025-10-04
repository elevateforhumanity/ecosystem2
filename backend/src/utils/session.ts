import { redis } from '../config/redis';
import { logger } from '../middleware/logger';

export class SessionService {
  private prefix = 'session:';
  private defaultTTL = 86400;

  private getKey(sessionId: string): string {
    return `${this.prefix}${sessionId}`;
  }

  async create(sessionId: string, data: any, ttl: number = this.defaultTTL): Promise<boolean> {
    try {
      const key = this.getKey(sessionId);
      await redis.setex(key, ttl, JSON.stringify(data));
      logger.debug('Session created', { sessionId });
      return true;
    } catch (error) {
      logger.error('Session create error', { sessionId, error });
      return false;
    }
  }

  async get(sessionId: string): Promise<any | null> {
    try {
      const key = this.getKey(sessionId);
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Session get error', { sessionId, error });
      return null;
    }
  }

  async update(sessionId: string, data: any, ttl: number = this.defaultTTL): Promise<boolean> {
    try {
      const key = this.getKey(sessionId);
      const existing = await this.get(sessionId);
      
      if (!existing) {
        return false;
      }

      const updated = { ...existing, ...data };
      await redis.setex(key, ttl, JSON.stringify(updated));
      logger.debug('Session updated', { sessionId });
      return true;
    } catch (error) {
      logger.error('Session update error', { sessionId, error });
      return false;
    }
  }

  async destroy(sessionId: string): Promise<boolean> {
    try {
      const key = this.getKey(sessionId);
      await redis.del(key);
      logger.debug('Session destroyed', { sessionId });
      return true;
    } catch (error) {
      logger.error('Session destroy error', { sessionId, error });
      return false;
    }
  }

  async exists(sessionId: string): Promise<boolean> {
    try {
      const key = this.getKey(sessionId);
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Session exists error', { sessionId, error });
      return false;
    }
  }

  async extend(sessionId: string, ttl: number = this.defaultTTL): Promise<boolean> {
    try {
      const key = this.getKey(sessionId);
      await redis.expire(key, ttl);
      logger.debug('Session extended', { sessionId, ttl });
      return true;
    } catch (error) {
      logger.error('Session extend error', { sessionId, error });
      return false;
    }
  }

  async destroyAll(userId: string): Promise<number> {
    try {
      const pattern = `${this.prefix}*:${userId}`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        const deleted = await redis.del(...keys);
        logger.info('All user sessions destroyed', { userId, count: deleted });
        return deleted;
      }
      
      return 0;
    } catch (error) {
      logger.error('Session destroy all error', { userId, error });
      return 0;
    }
  }
}

export const sessionService = new SessionService();
