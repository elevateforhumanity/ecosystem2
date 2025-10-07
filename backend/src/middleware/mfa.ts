import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Require MFA verification for sensitive operations
 */
export const requireMFA = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Check if user has MFA enabled
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { mfaEnabled: true }
    });

    if (!user?.mfaEnabled) {
      // MFA not enabled, allow access
      return next();
    }

    // Check if MFA was verified in this session
    if (!req.session?.mfaVerified) {
      throw new AppError('MFA verification required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Mark MFA as verified in session
 */
export const markMFAVerified = (req: AuthRequest) => {
  if (req.session) {
    req.session.mfaVerified = true;
    req.session.mfaVerifiedAt = new Date();
  }
};

/**
 * Check if MFA verification is still valid (expires after 30 minutes)
 */
export const isMFAVerificationValid = (req: AuthRequest): boolean => {
  if (!req.session?.mfaVerified || !req.session?.mfaVerifiedAt) {
    return false;
  }

  const verifiedAt = new Date(req.session.mfaVerifiedAt);
  const now = new Date();
  const thirtyMinutes = 30 * 60 * 1000;

  return (now.getTime() - verifiedAt.getTime()) < thirtyMinutes;
};
