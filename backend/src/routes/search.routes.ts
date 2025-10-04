import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ results: [], total: 0, stats: { courses: 0, instructors: 0, pages: 0 } });
});

export default router;
