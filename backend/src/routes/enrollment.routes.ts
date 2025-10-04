import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getEnrollments } from '../controllers/progress.controller';

const router = Router();

router.get('/', authenticate, getEnrollments);

export default router;
