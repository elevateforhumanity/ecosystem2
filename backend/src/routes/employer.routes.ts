import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as employerController from '../controllers/employer.controller';

const router = Router();

// Employers
router.post('/employers', authenticate, authorize('admin', 'case_manager'), employerController.createEmployer);
router.get('/employers', authenticate, authorize('admin', 'case_manager', 'participant'), employerController.getEmployers);
router.get('/employers/:id', authenticate, authorize('admin', 'case_manager', 'participant'), employerController.getEmployerById);
router.put('/employers/:id', authenticate, authorize('admin', 'case_manager'), employerController.updateEmployer);

// Job Postings
router.post('/jobs', authenticate, authorize('admin', 'case_manager'), employerController.createJobPosting);
router.get('/jobs', authenticate, authorize('admin', 'case_manager', 'participant'), employerController.getJobPostings);
router.put('/jobs/:id', authenticate, authorize('admin', 'case_manager'), employerController.updateJobPosting);

// Applications
router.post('/applications', authenticate, authorize('admin', 'case_manager', 'participant'), employerController.createApplication);
router.get('/applications', authenticate, authorize('admin', 'case_manager', 'participant'), employerController.getApplications);
router.put('/applications/:id', authenticate, authorize('admin', 'case_manager'), employerController.updateApplicationStatus);

// Placements
router.post('/placements', authenticate, authorize('admin', 'case_manager'), employerController.createPlacement);
router.get('/placements', authenticate, authorize('admin', 'case_manager', 'participant'), employerController.getPlacements);
router.post('/placements/:id/retention', authenticate, authorize('admin', 'case_manager'), employerController.addRetentionCheck);

// Employer Engagement
router.post('/engagements', authenticate, authorize('admin', 'case_manager'), employerController.createEngagement);
router.get('/engagements', authenticate, authorize('admin', 'case_manager'), employerController.getEngagements);

export default router;
