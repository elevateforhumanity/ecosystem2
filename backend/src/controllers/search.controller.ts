import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const search = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { q, type, category } = req.query;

  if (!q || typeof q !== 'string') {
    res.json({ results: [], total: 0, stats: { courses: 0, instructors: 0, pages: 0 } });
    return;
  }

  const searchTerm = q.trim();
  const results: any[] = [];

  if (!type || type === 'course') {
    const courses = await prisma.course.findMany({
      where: {
        published: true,
        ...(category && { category: category as string }),
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        instructor: {
          select: { name: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      take: 20,
    });

    for (const course of courses) {
      const avgRating = await prisma.review.aggregate({
        where: { courseId: course.id },
        _avg: { rating: true },
      });

      results.push({
        type: 'course',
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        rating: avgRating._avg.rating || 0,
        enrollments: course._count.enrollments,
      });
    }
  }

  if (!type || type === 'instructor') {
    const instructors = await prisma.user.findMany({
      where: {
        role: 'instructor',
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { bio: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        _count: {
          select: { courses: true },
        },
      },
      take: 10,
    });

    instructors.forEach((instructor) => {
      results.push({
        type: 'instructor',
        id: instructor.id,
        title: instructor.name,
        description: instructor.bio || '',
        category: 'instructor',
      });
    });
  }

  const stats = {
    courses: results.filter((r) => r.type === 'course').length,
    instructors: results.filter((r) => r.type === 'instructor').length,
    pages: 0,
  };

  res.json({
    results,
    total: results.length,
    stats,
  });
});
