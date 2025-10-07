import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MFAService {
  /**
   * Generate MFA secret for user
   */
  async generateSecret(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      name: `Elevate (${email})`,
      issuer: 'Elevate for Humanity',
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauthUrl: secret.otpauth_url
    };
  }

  /**
   * Verify TOTP token
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps before/after
    });
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash backup codes for storage
   */
  hashBackupCodes(codes: string[]): string[] {
    return codes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(code: string, hashedCodes: string[]): boolean {
    const hashedInput = crypto.createHash('sha256').update(code).digest('hex');
    return hashedCodes.includes(hashedInput);
  }

  /**
   * Enable MFA for user
   */
  async enableMFA(
    userId: string,
    secret: string,
    method: string = 'totp'
  ): Promise<{ backupCodes: string[] }> {
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = this.hashBackupCodes(backupCodes);

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: secret,
        mfaMethod: method,
        mfaBackupCodes: hashedBackupCodes
      }
    });

    return { backupCodes };
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaMethod: null,
        mfaBackupCodes: []
      }
    });
  }

  /**
   * Log MFA attempt
   */
  async logAttempt(
    userId: string,
    method: string,
    success: boolean,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await prisma.mFAAttempt.create({
      data: {
        userId,
        method,
        success,
        ipAddress,
        userAgent
      }
    });

    // Check for suspicious activity (5+ failed attempts)
    if (!success) {
      const recentFailures = await prisma.mFAAttempt.count({
        where: {
          userId,
          success: false,
          createdAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
          }
        }
      });

      if (recentFailures >= 5) {
        // TODO: Send alert, temporarily lock account
        console.warn(`User ${userId} has ${recentFailures} failed MFA attempts`);
      }
    }
  }

  /**
   * Remove used backup code
   */
  async removeBackupCode(userId: string, code: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaBackupCodes: true }
    });

    if (!user) return;

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    const updatedCodes = user.mfaBackupCodes.filter(c => c !== hashedCode);

    await prisma.user.update({
      where: { id: userId },
      data: { mfaBackupCodes: updatedCodes }
    });
  }
}

export const mfaService = new MFAService();
