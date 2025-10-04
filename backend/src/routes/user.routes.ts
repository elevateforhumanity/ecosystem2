import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserById,
  updateCurrentUser,
  changePassword,
  deleteAccount,
  getUserStats,
} from '../controllers/user.controller';

const router = Router();

router.get('/:id', getUserById);
router.patch('/me', authenticate, updateCurrentUser);
router.post('/me/change-password', authenticate, changePassword);
router.delete('/me', authenticate, deleteAccount);
router.get('/me/stats', authenticate, getUserStats);

export default router;
