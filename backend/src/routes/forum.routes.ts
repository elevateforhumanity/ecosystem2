import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as forumController from '../controllers/forum.controller';

const router = Router();

// Public routes
router.get('/categories', forumController.getCategories);
router.get('/threads', forumController.getThreads);
router.get('/threads/:id', forumController.getThread);

// Protected routes
router.post('/threads', authenticate, forumController.createThread);
router.post('/threads/:threadId/posts', authenticate, forumController.createPost);
router.patch('/posts/:id', authenticate, forumController.updatePost);
router.delete('/posts/:id', authenticate, forumController.deletePost);

export default router;
