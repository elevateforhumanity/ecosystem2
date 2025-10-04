import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCertificates,
  getCertificateById,
  verifyCertificate,
} from '../controllers/certificate.controller';

const router = Router();

router.get('/', authenticate, getCertificates);
router.get('/:id', authenticate, getCertificateById);
router.get('/verify/:certificateId', verifyCertificate);

export default router;
