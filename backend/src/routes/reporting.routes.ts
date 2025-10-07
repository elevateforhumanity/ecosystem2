import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as reportingController from '../controllers/reporting.controller';

const router = Router();

router.get('/available', authenticate, authorize('admin', 'case_manager'), reportingController.getAvailableReports);
router.get('/pirl', authenticate, authorize('admin'), reportingController.generatePIRLReport);
router.get('/pirl/export', authenticate, authorize('admin'), reportingController.exportPIRLReport);
router.get('/eta-9130', authenticate, authorize('admin'), reportingController.generateETA9130Report);
router.get('/eta-9169', authenticate, authorize('admin'), reportingController.generateETA9169Report);

export default router;
