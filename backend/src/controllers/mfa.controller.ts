import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { mfaService } from '../services/mfa.service';
import { markMFAVerified } from '../middleware/mfa';
import { AppError } from '../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Setup MFA - Generate secret and QR code
 */
export const setupMFA = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, mfaEnabled: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.mfaEnabled) {
      throw new AppError('MFA already enabled', 400);
    }

    const { secret, qrCode, otpauthUrl } = await mfaService.generateSecret(
      req.user.id,
      user.email
    );

    res.json({
      success: true,
      data: {
        secret,
        qrCode,
        otpauthUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify setup and enable MFA
 */
export const verifySetup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { secret, token } = req.body;

    if (!secret || !token) {
      throw new AppError('Secret and token required', 400);
    }

    // Verify token
    const isValid = mfaService.verifyToken(secret, token);

    if (!isValid) {
      throw new AppError('Invalid verification code', 400);
    }

    // Enable MFA
    const { backupCodes } = await mfaService.enableMFA(
      req.user.id,
      secret,
      'totp'
    );

    // Log successful setup
    await mfaService.logAttempt(
      req.user.id,
      'totp',
      true,
      req.ip,
      req.headers['user-agent'] || ''
    );

    res.json({
      success: true,
      message: 'MFA enabled successfully',
      data: {
        backupCodes // Show once, user must save them
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify MFA code during login
 */
export const verifyMFA = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { token, backupCode } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        mfaEnabled: true,
        mfaSecret: true,
        mfaBackupCodes: true
      }
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new AppError('MFA not enabled', 400);
    }

    let isValid = false;
    let method = 'totp';

    // Try TOTP token first
    if (token) {
      isValid = mfaService.verifyToken(user.mfaSecret, token);
    }
    // Try backup code if token failed or not provided
    else if (backupCode) {
      isValid = mfaService.verifyBackupCode(backupCode, user.mfaBackupCodes);
      method = 'backup';

      // Remove used backup code
      if (isValid) {
        await mfaService.removeBackupCode(req.user.id, backupCode);
      }
    } else {
      throw new AppError('Token or backup code required', 400);
    }

    // Log attempt
    await mfaService.logAttempt(
      req.user.id,
      method,
      isValid,
      req.ip,
      req.headers['user-agent'] || ''
    );

    if (!isValid) {
      throw new AppError('Invalid verification code', 400);
    }

    // Mark MFA as verified in session
    markMFAVerified(req);

    res.json({
      success: true,
      message: 'MFA verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable MFA
 */
export const disableMFA = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { password } = req.body;

    if (!password) {
      throw new AppError('Password required to disable MFA', 400);
    }

    // Verify password (implement password verification)
    // const isValidPassword = await verifyPassword(req.user.id, password);
    // if (!isValidPassword) {
    //   throw new AppError('Invalid password', 401);
    // }

    await mfaService.disableMFA(req.user.id);

    res.json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate new backup codes
 */
export const generateBackupCodes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { mfaEnabled: true }
    });

    if (!user?.mfaEnabled) {
      throw new AppError('MFA not enabled', 400);
    }

    // Generate new backup codes
    const backupCodes = mfaService.generateBackupCodes();
    const hashedBackupCodes = mfaService.hashBackupCodes(backupCodes);

    // Update user
    await prisma.user.update({
      where: { id: req.user.id },
      data: { mfaBackupCodes: hashedBackupCodes }
    });

    res.json({
      success: true,
      data: {
        backupCodes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get MFA status
 */
export const getMFAStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        mfaEnabled: true,
        mfaMethod: true,
        phoneNumber: true,
        phoneVerified: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        mfaEnabled: user.mfaEnabled,
        mfaMethod: user.mfaMethod,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    next(error);
  }
};
