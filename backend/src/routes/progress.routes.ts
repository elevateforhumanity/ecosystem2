import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getProgress,
  updateProgress,
  resetProgress,
} from '../controllers/progress.controller';

const router = Router();

router.get('/', authenticate, getProgress);
router.post('/:courseId/:lessonId', authenticate, updateProgress);
router.delete('/:courseId', authenticate, resetProgress);

export default router;
