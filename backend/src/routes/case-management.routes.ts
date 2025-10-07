import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as caseController from '../controllers/case-management.controller';

const router = Router();

router.post('/', authenticate, authorize('admin', 'case_manager'), caseController.createCase);
router.get('/', authenticate, authorize('admin', 'case_manager'), caseController.getCases);
router.get('/:id', authenticate, authorize('admin', 'case_manager', 'participant'), caseController.getCaseById);
router.put('/:id', authenticate, authorize('admin', 'case_manager'), caseController.updateCase);
router.post('/:id/notes', authenticate, authorize('admin', 'case_manager'), caseController.addCaseNote);
router.post('/:id/activities', authenticate, authorize('admin', 'case_manager'), caseController.addCaseActivity);
router.post('/:id/referrals', authenticate, authorize('admin', 'case_manager'), caseController.addReferral);
router.put('/:id/referrals/:referralId', authenticate, authorize('admin', 'case_manager'), caseController.updateReferralStatus);
router.post('/:id/assessment', authenticate, authorize('admin', 'case_manager'), caseController.completeAssessment);
router.post('/:id/close', authenticate, authorize('admin', 'case_manager'), caseController.closeCase);

export default router;
