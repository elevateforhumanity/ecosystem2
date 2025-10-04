import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, (req, res) => {
  res.json({ 
    url: 'https://example.com/uploads/file.jpg',
    filename: 'file.jpg',
    size: 102400,
    type: 'image/jpeg'
  });
});

export default router;
