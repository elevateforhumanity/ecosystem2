import { Response } from 'express';
import prisma from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          lessons: {
            select: { id: true },
          },
        },
      },
    },
  });

  const progressData: any = {};

  for (const enrollment of enrollments) {
    const lessons = await prisma.progress.findMany({
      where: {
        userId,
        lesson: {
          courseId: enrollment.courseId,
        },
      },
    });

    const lessonsMap: any = {};
    lessons.forEach((lesson) => {
      lessonsMap[lesson.lessonId] = lesson.completed;
    });

    const completedCount = lessons.filter((l) => l.completed).length;
    const totalCount = enrollment.course.lessons.length;

    progressData[enrollment.courseId] = {
      lessons: lessonsMap,
      completedCount,
      totalCount,
      progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
    };
  }

  res.json({ progress: progressData });
});

export const updateProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { courseId, lessonId } = req.params;
  const { completed } = req.body;
  const userId = req.user!.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment) {
    throw new AppError('Not enrolled in this course', 403);
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson || lesson.courseId !== courseId) {
    throw new AppError('Lesson not found', 404);
  }

  const progress = await prisma.progress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    update: {
      completed: Boolean(completed),
      completedAt: completed ? new Date() : null,
    },
    create: {
      userId,
      lessonId,
      completed: Boolean(completed),
      completedAt: completed ? new Date() : null,
    },
  });

  const allProgress = await prisma.progress.findMany({
    where: {
      userId,
      lesson: {
        courseId,
      },
    },
  });

  const completedCount = allProgress.filter((p) => p.completed).length;
  const totalLessons = await prisma.lesson.count({ where: { courseId } });
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  await prisma.enrollment.update({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    data: {
      progress: Math.round(progressPercentage),
      ...(progressPercentage === 100 && !enrollment.completedAt && { completedAt: new Date() }),
    },
  });

  if (progressPercentage === 100 && !enrollment.completedAt) {
    const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    await prisma.certificate.create({
      data: {
        certificateId,
        userId,
        courseId,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'certificate',
        title: 'Certificate Earned!',
        message: 'Congratulations! You have earned a certificate for completing this course.',
      },
    });
  }

  res.json({ progress, message: 'Progress updated' });
});

export const resetProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const userId = req.user!.id;

  await prisma.progress.deleteMany({
    where: {
      userId,
      lesson: {
        courseId,
      },
    },
  });

  await prisma.enrollment.update({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    data: {
      progress: 0,
      completedAt: null,
    },
  });

  res.json({ message: 'Progress reset successfully' });
});

export const getEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  res.json({ enrollments });
});
