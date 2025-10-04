import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', (req, res) => {
  res.json({
    overview: {
      totalUsers: { value: 12458, change: 12.5 },
      activeCourses: { value: 342, change: 8.3 },
      revenue: { value: 45230, change: 15.7 },
      supportTickets: { value: 23, change: -18.2 },
    },
    userGrowth: [],
    courseEnrollments: [],
  });
});

router.get('/users', (req, res) => {
  res.json({ users: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
});

router.patch('/users/:id', (req, res) => {
  res.json({ message: 'User updated' });
});

export default router;
