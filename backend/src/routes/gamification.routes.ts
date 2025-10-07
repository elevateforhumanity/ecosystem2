import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as gamificationController from '../controllers/gamification.controller';

const router = Router();

// Public routes
router.get('/badges', gamificationController.getBadges);
router.get('/leaderboard', gamificationController.getLeaderboard);

// User-specific routes (authenticated)
router.get('/users/:userId/badges', authenticate, gamificationController.getUserBadges);
router.get('/users/:userId/points', authenticate, gamificationController.getUserPoints);
router.get('/users/:userId/rank', authenticate, gamificationController.getUserRank);

// Admin/Instructor routes
router.post('/badges/award', authenticate, authorize('admin', 'instructor'), gamificationController.awardBadge);
router.post('/points/add', authenticate, authorize('admin', 'instructor'), gamificationController.addPoints);

export default router;
