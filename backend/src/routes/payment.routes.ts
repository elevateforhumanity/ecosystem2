import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createPaymentIntent,
  createCheckoutSession,
  getPaymentHistory,
  refundPayment,
} from '../controllers/payment.controller';

const router = Router();

router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/create-checkout', authenticate, createCheckoutSession);
router.get('/history', authenticate, getPaymentHistory);
router.post('/:id/refund', authenticate, refundPayment);

export default router;
