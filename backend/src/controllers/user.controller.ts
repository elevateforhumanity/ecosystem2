import { Response } from 'express';
import prisma from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcrypt';

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          courses: true,
          enrollments: true,
          certificates: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
});

export const updateCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, bio, avatarUrl } = req.body;
  const userId = req.user!.id;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      avatarUrl: true,
      role: true,
    },
  });

  res.json(user);
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 401);
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  await prisma.session.deleteMany({
    where: { userId },
  });

  res.json({ message: 'Password changed successfully. Please login again.' });
});

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { password } = req.body;

  if (!password) {
    throw new AppError('Password is required to delete account', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Invalid password', 401);
  }

  await prisma.user.delete({ where: { id: userId } });

  res.json({ message: 'Account deleted successfully' });
});

export const getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const [enrollments, completedCourses, certificates, totalProgress] = await Promise.all([
    prisma.enrollment.count({ where: { userId } }),
    prisma.enrollment.count({ where: { userId, completedAt: { not: null } } }),
    prisma.certificate.count({ where: { userId } }),
    prisma.progress.aggregate({
      where: { userId, completed: true },
      _count: true,
    }),
  ]);

  res.json({
    enrollments,
    completedCourses,
    certificates,
    lessonsCompleted: totalProgress._count,
  });
});
