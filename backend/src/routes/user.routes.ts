import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:id', (req, res) => {
  res.json({ message: 'Get user by ID - Coming soon' });
});

router.patch('/me', authenticate, (req, res) => {
  res.json({ message: 'Update current user - Coming soon' });
});

export default router;
