import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as validationController from '../controllers/validation.controller';

const router = Router();

router.get('/validators', authenticate, authorize('admin', 'case_manager'), validationController.getAvailableValidators);
router.get('/rules/:type', authenticate, authorize('admin', 'case_manager'), validationController.getValidationRules);
router.post('/validate/:type', authenticate, authorize('admin', 'case_manager'), validationController.validateRecord);
router.post('/validate-batch/:type', authenticate, authorize('admin', 'case_manager'), validationController.validateBatch);

export default router;
