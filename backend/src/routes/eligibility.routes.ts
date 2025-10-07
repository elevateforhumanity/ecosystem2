import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getEligibility,
  createEligibility,
  updateEligibility,
  approveEligibility,
  getPendingEligibility
} from '../controllers/eligibility.controller';

const router = Router();

// Get eligibility for current user or specific user
router.get('/:userId?', authenticate, getEligibility);

// Create eligibility record
router.post('/', authenticate, createEligibility);

// Update eligibility record
router.put('/:id', authenticate, updateEligibility);

// Approve/deny eligibility (admin/case manager only)
router.post('/:id/approve', authenticate, authorize('admin', 'case_manager'), approveEligibility);

// Get all pending eligibility records (admin/case manager only)
router.get('/pending/all', authenticate, authorize('admin', 'case_manager'), getPendingEligibility);

export default router;
