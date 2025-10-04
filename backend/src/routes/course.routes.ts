import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  res.json({ courses: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get course details - Coming soon' });
});

router.post('/', authenticate, authorize('instructor', 'admin'), (req, res) => {
  res.json({ message: 'Create course - Coming soon' });
});

router.patch('/:id', authenticate, authorize('instructor', 'admin'), (req, res) => {
  res.json({ message: 'Update course - Coming soon' });
});

router.delete('/:id', authenticate, authorize('instructor', 'admin'), (req, res) => {
  res.status(204).send();
});

router.post('/:id/enroll', authenticate, (req, res) => {
  res.json({ message: 'Enroll in course - Coming soon' });
});

export default router;
