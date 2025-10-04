import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json({ progress: {} });
});

router.post('/:courseId/:lessonId', authenticate, (req, res) => {
  res.json({ message: 'Progress updated' });
});

router.delete('/:courseId', authenticate, (req, res) => {
  res.json({ message: 'Progress reset' });
});

export default router;
