import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/create-intent', authenticate, (req, res) => {
  res.json({ clientSecret: 'pi_test_secret' });
});

router.post('/create-checkout', authenticate, (req, res) => {
  res.json({ sessionId: 'cs_test_session' });
});

router.get('/history', authenticate, (req, res) => {
  res.json({ payments: [] });
});

router.post('/:id/refund', authenticate, (req, res) => {
  res.json({ message: 'Refund processed' });
});

export default router;
