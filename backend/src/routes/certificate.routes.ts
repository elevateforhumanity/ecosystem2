import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json({ certificates: [] });
});

router.get('/:id', authenticate, (req, res) => {
  res.json({ message: 'Get certificate - Coming soon' });
});

router.get('/verify/:certificateId', (req, res) => {
  res.json({ valid: false, message: 'Verification - Coming soon' });
});

export default router;
