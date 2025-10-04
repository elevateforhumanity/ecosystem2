import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload, uploadFile } from '../controllers/upload.controller';

const router = Router();

router.post('/', authenticate, upload.single('file'), uploadFile);

export default router;
