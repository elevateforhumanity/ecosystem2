import { Request } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BotDetectionService {
  private suspiciousIPs: Map<string, number> = new Map();
  private requestPatterns: Map<string, number[]> = new Map();

  /**
   * Detect if request is from a bot
   */
  async detectBot(req: Request): Promise<boolean> {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip;

    // Check 1: Known bot user agents
    if (this.isKnownBot(userAgent)) {
      await this.logBotAttempt(ip, userAgent, 'known_bot');
      return true;
    }

    // Check 2: Missing or suspicious user agent
    if (!userAgent || userAgent.length < 10) {
      await this.logBotAttempt(ip, userAgent, 'suspicious_ua');
      return true;
    }

    // Check 3: Headless browser detection
    if (this.isHeadlessBrowser(userAgent)) {
      await this.logBotAttempt(ip, userAgent, 'headless');
      return true;
    }

    // Check 4: Request pattern analysis
    if (await this.isSuspiciousPattern(ip, req.path)) {
      await this.logBotAttempt(ip, userAgent, 'suspicious_pattern');
      return true;
    }

    // Check 5: Request speed (too fast = bot)
    if (await this.isTooFast(ip)) {
      await this.logBotAttempt(ip, userAgent, 'too_fast');
      return true;
    }

    return false;
  }

  /**
   * Check if user agent matches known bots
   */
  private isKnownBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /scrapy/i,
      /selenium/i,
      /puppeteer/i,
      /playwright/i,
      /phantomjs/i,
      /headless/i,
      /GPTBot/i,
      /ChatGPT/i,
      /Claude/i,
      /anthropic/i,
      /Bytespider/i,
      /CCBot/i,
      /Google-Extended/i,
      /PerplexityBot/i,
      /Amazonbot/i
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Detect headless browsers
   */
  private isHeadlessBrowser(userAgent: string): boolean {
    const headlessPatterns = [
      /HeadlessChrome/i,
      /PhantomJS/i,
      /Headless/i,
      /Chrome\/\d+\.0\.0\.0/i
    ];

    return headlessPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Analyze request patterns for suspicious activity
   */
  private async isSuspiciousPattern(ip: string, path: string): Promise<boolean> {
    const now = Date.now();

    // Get recent requests from this IP
    const requests = this.requestPatterns.get(ip) || [];
    requests.push(now);

    // Keep only last 60 seconds
    const recentRequests = requests.filter(t => now - t < 60000);
    this.requestPatterns.set(ip, recentRequests);

    // Suspicious if more than 30 requests in 60 seconds
    if (recentRequests.length > 30) {
      return true;
    }

    return false;
  }

  /**
   * Check if requests are too fast (< 100ms between requests)
   */
  private async isTooFast(ip: string): Promise<boolean> {
    const requests = this.requestPatterns.get(ip) || [];

    if (requests.length < 2) return false;

    // Check last 2 requests
    const lastTwo = requests.slice(-2);
    const timeDiff = lastTwo[1] - lastTwo[0];

    // If less than 100ms between requests, likely a bot
    return timeDiff < 100;
  }

  /**
   * Log bot attempt to database
   */
  private async logBotAttempt(
    ip: string,
    userAgent: string,
    reason: string
  ): Promise<void> {
    try {
      await prisma.botAttempt.create({
        data: {
          ipAddress: ip,
          userAgent,
          reason,
          timestamp: new Date()
        }
      });

      // Increment suspicious IP counter
      const count = (this.suspiciousIPs.get(ip) || 0) + 1;
      this.suspiciousIPs.set(ip, count);

      // Auto-block after 5 attempts
      if (count >= 5) {
        await this.blockIP(ip, `Bot detected: ${reason}`);
      }
    } catch (error) {
      console.error('Failed to log bot attempt:', error);
    }
  }

  /**
   * Block IP address
   */
  private async blockIP(ip: string, reason: string): Promise<void> {
    try {
      await prisma.blockedIP.create({
        data: {
          ipAddress: ip,
          reason,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });
    } catch (error) {
      // IP might already be blocked
      console.error('Failed to block IP:', error);
    }
  }

  /**
   * Check if IP is blocked
   */
  async isIPBlocked(ip: string): Promise<boolean> {
    const blocked = await prisma.blockedIP.findFirst({
      where: {
        ipAddress: ip,
        expiresAt: { gte: new Date() }
      }
    });

    return !!blocked;
  }

  /**
   * Clean up expired blocks (run periodically)
   */
  async cleanupExpiredBlocks(): Promise<void> {
    await prisma.blockedIP.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });
  }
}

export const botDetectionService = new BotDetectionService();
