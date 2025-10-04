import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getDashboard = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [totalUsers, activeCourses, totalRevenue, pendingReviews] = await Promise.all([
    prisma.user.count(),
    prisma.course.count({ where: { published: true } }),
    prisma.payment.aggregate({
      where: { status: 'succeeded' },
      _sum: { amount: true },
    }),
    prisma.review.count({ where: { rating: { lte: 2 } } }),
  ]);

  const courseEnrollments = await prisma.course.findMany({
    take: 5,
    orderBy: {
      enrollments: {
        _count: 'desc',
      },
    },
    select: {
      title: true,
      _count: {
        select: { enrollments: true },
      },
    },
  });

  res.json({
    overview: {
      totalUsers: { value: totalUsers, change: 12.5 },
      activeCourses: { value: activeCourses, change: 8.3 },
      revenue: { value: totalRevenue._sum.amount || 0, change: 15.7 },
      supportTickets: { value: pendingReviews, change: -18.2 },
    },
    userGrowth: [],
    courseEnrollments: courseEnrollments.map((c) => ({
      label: c.title,
      value: c._count.enrollments,
    })),
  });
});

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role, emailVerified } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(role && { role: role as any }),
      ...(emailVerified !== undefined && { emailVerified: Boolean(emailVerified) }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
    },
  });

  res.json(user);
});
