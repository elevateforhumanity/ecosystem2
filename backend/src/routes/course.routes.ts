import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  addLesson,
} from '../controllers/course.controller';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', authenticate, authorize('instructor', 'admin'), createCourse);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteCourse);
router.post('/:id/enroll', authenticate, enrollInCourse);
router.post('/:id/lessons', authenticate, authorize('instructor', 'admin'), addLesson);

export default router;
