import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload, uploadFile } from '../controllers/upload.controller';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', authenticate, uploadLimiter, upload.single('file'), uploadFile);

export default router;
