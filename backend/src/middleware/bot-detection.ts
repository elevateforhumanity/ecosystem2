import { Request, Response, NextFunction } from 'express';
import { botDetectionService } from '../services/bot-detection.service';

/**
 * Block bots middleware
 */
export const blockBots = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if IP is blocked
    const isBlocked = await botDetectionService.isIPBlocked(req.ip);

    if (isBlocked) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP has been blocked due to suspicious activity'
      });
    }

    // Detect bot
    const isBot = await botDetectionService.detectBot(req);

    if (isBot) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Automated access is not permitted'
      });
    }

    next();
  } catch (error) {
    // Don't block on error, just log it
    console.error('Bot detection error:', error);
    next();
  }
};

/**
 * Block bots on sensitive endpoints only
 */
export const blockBotsOnSensitive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Only check for bots on sensitive paths
  const sensitivePaths = [
    '/api/participants',
    '/api/admin',
    '/api/reports',
    '/api/export'
  ];

  const isSensitive = sensitivePaths.some(path => req.path.startsWith(path));

  if (isSensitive) {
    return blockBots(req, res, next);
  }

  next();
};
