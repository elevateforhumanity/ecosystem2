import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as supportController from '../controllers/support-services.controller';

const router = Router();

// Support Services
router.post('/services', authenticate, authorize('admin', 'case_manager'), supportController.createSupportService);
router.get('/services', authenticate, authorize('admin', 'case_manager', 'participant'), supportController.getSupportServices);
router.get('/services/:id', authenticate, authorize('admin', 'case_manager', 'participant'), supportController.getSupportServiceById);
router.put('/services/:id', authenticate, authorize('admin', 'case_manager'), supportController.updateSupportService);
router.post('/services/:id/approve', authenticate, authorize('admin', 'case_manager'), supportController.approveSupportService);
router.post('/services/:id/outcomes', authenticate, authorize('admin', 'case_manager'), supportController.addServiceOutcome);
router.post('/services/:id/complete', authenticate, authorize('admin', 'case_manager'), supportController.completeSupportService);

// Service Requests
router.post('/requests', authenticate, authorize('admin', 'case_manager', 'participant'), supportController.createServiceRequest);
router.get('/requests', authenticate, authorize('admin', 'case_manager'), supportController.getServiceRequests);
router.post('/requests/:id/review', authenticate, authorize('admin', 'case_manager'), supportController.reviewServiceRequest);

// Service Providers
router.post('/providers', authenticate, authorize('admin'), supportController.createServiceProvider);
router.get('/providers', authenticate, authorize('admin', 'case_manager'), supportController.getServiceProviders);
router.put('/providers/:id', authenticate, authorize('admin'), supportController.updateServiceProvider);

export default router;
