import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json({ notifications: [] });
});

router.patch('/:id/read', authenticate, (req, res) => {
  res.json({ message: 'Marked as read' });
});

router.post('/read-all', authenticate, (req, res) => {
  res.json({ message: 'All marked as read' });
});

router.delete('/:id', authenticate, (req, res) => {
  res.status(204).send();
});

export default router;
