import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createIEP, getIEPs, updateIEP, signIEP, reviewIEP } from '../controllers/iep.controller';

const router = Router();

router.post('/', authenticate, authorize('case_manager', 'admin'), createIEP);
router.get('/', authenticate, getIEPs);
router.put('/:id', authenticate, updateIEP);
router.post('/:id/sign', authenticate, signIEP);
router.post('/:id/review', authenticate, authorize('case_manager', 'admin'), reviewIEP);

export default router;
