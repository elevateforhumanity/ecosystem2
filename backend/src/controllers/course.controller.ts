import { Response } from 'express';
import prisma from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, category, search, level } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { published: true };
  if (category) where.category = category;
  if (level) where.level = level;
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        instructor: {
          select: { id: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { enrollments: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.course.count({ where }),
  ]);

  const coursesWithRatings = await Promise.all(
    courses.map(async (course) => {
      const avgRating = await prisma.review.aggregate({
        where: { courseId: course.id },
        _avg: { rating: true },
      });

      return {
        ...course,
        rating: avgRating._avg.rating || 0,
        enrollments: course._count.enrollments,
      };
    })
  );

  res.json({
    courses: coursesWithRatings,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getCourseById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: {
        select: { id: true, name: true, bio: true, avatarUrl: true },
      },
      lessons: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          order: true,
        },
      },
      _count: {
        select: { enrollments: true, reviews: true },
      },
    },
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const avgRating = await prisma.review.aggregate({
    where: { courseId: course.id },
    _avg: { rating: true },
  });

  const isEnrolled = req.user
    ? await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: req.user.id,
            courseId: course.id,
          },
        },
      })
    : null;

  res.json({
    ...course,
    rating: avgRating._avg.rating || 0,
    enrollments: course._count.enrollments,
    isEnrolled: !!isEnrolled,
  });
});

export const createCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, category, level, price, thumbnailUrl } = req.body;
  const instructorId = req.user!.id;

  if (!title || !description || !category || !level || price === undefined) {
    throw new AppError('Missing required fields', 400);
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const course = await prisma.course.create({
    data: {
      title,
      slug: `${slug}-${Date.now()}`,
      description,
      instructorId,
      category,
      level: level as any,
      price: Number(price),
      thumbnailUrl,
    },
    include: {
      instructor: {
        select: { id: true, name: true },
      },
    },
  });

  return res.status(201).json(course);
});

export const updateCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, category, level, price, thumbnailUrl, published } = req.body;
  const userId = req.user!.id;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructorId !== userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorized to update this course', 403);
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(level && { level: level as any }),
      ...(price !== undefined && { price: Number(price) }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      ...(published !== undefined && { published: Boolean(published) }),
    },
  });

  res.json(updated);
});

export const deleteCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructorId !== userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorized to delete this course', 403);
  }

  await prisma.course.delete({ where: { id } });

  return res.status(204).send();
});

export const enrollInCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.published) {
    throw new AppError('Course is not published', 400);
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: id,
      },
    },
  });

  if (existing) {
    throw new AppError('Already enrolled in this course', 409);
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId: id,
    },
  });

  res.json({ enrollment, message: 'Successfully enrolled in course' });
});

export const addLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, content, videoUrl, duration, order } = req.body;
  const userId = req.user!.id;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructorId !== userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  const lesson = await prisma.lesson.create({
    data: {
      courseId: id,
      title,
      description,
      content,
      videoUrl,
      duration: duration ? Number(duration) : null,
      order: order ? Number(order) : 0,
    },
  });

  return res.status(201).json(lesson);
});
