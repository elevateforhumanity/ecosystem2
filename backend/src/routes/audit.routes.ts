import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as auditController from '../controllers/audit.controller';

const router = Router();

router.get('/logs', authenticate, authorize('admin'), auditController.getAuditLogs);
router.get('/logs/:id', authenticate, authorize('admin'), auditController.getAuditLogById);
router.get('/summary', authenticate, authorize('admin'), auditController.getAuditSummary);
router.get('/user/:userId', authenticate, authorize('admin'), auditController.getUserActivity);
router.get('/resource/:resource', authenticate, authorize('admin'), auditController.getResourceActivity);
router.get('/resource/:resource/:resourceId', authenticate, authorize('admin'), auditController.getResourceActivity);
router.get('/export', authenticate, authorize('admin'), auditController.exportAuditLogs);

export default router;
