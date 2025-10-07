import { Router } from 'express';
import {
  setupMFA,
  verifySetup,
  verifyMFA,
  disableMFA,
  generateBackupCodes,
  getMFAStatus
} from '../controllers/mfa.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// All MFA routes require authentication
router.use(authenticate);

// Get MFA status
router.get('/status', getMFAStatus);

// Setup MFA (get QR code)
router.post('/setup', setupMFA);

// Verify setup and enable MFA
router.post('/verify-setup', verifySetup);

// Verify MFA code during login
router.post('/verify', authLimiter, verifyMFA);

// Disable MFA
router.post('/disable', disableMFA);

// Generate new backup codes
router.post('/backup-codes', generateBackupCodes);

export default router;
