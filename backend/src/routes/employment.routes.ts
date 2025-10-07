import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createEmploymentOutcome, getEmploymentOutcomes, updateEmploymentOutcome, verifyEmployment, updateRetention } from '../controllers/employment.controller';

const router = Router();

router.post('/', authenticate, createEmploymentOutcome);
router.get('/', authenticate, getEmploymentOutcomes);
router.put('/:id', authenticate, updateEmploymentOutcome);
router.post('/:id/verify', authenticate, authorize('admin', 'case_manager'), verifyEmployment);
router.post('/:id/retention', authenticate, authorize('admin', 'case_manager'), updateRetention);

export default router;
