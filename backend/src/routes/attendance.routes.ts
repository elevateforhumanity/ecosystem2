import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { clockIn, clockOut, getAttendance, markAbsent, excuseAbsence } from '../controllers/attendance.controller';

const router = Router();

router.post('/clock-in', authenticate, clockIn);
router.post('/:id/clock-out', authenticate, clockOut);
router.get('/', authenticate, getAttendance);
router.post('/mark-absent', authenticate, authorize('instructor', 'admin'), markAbsent);
router.post('/:id/excuse', authenticate, authorize('instructor', 'admin'), excuseAbsence);

export default router;
