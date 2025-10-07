import { Response } from 'express';
import prisma from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user!.id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({ notifications });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const userId = authReq.user!.id;

  const notification = await prisma.notification.findUnique({ where: { id } });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError('Not authorized', 403);
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  res.json({ message: 'Marked as read' });
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user!.id;

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  res.json({ message: 'All notifications marked as read' });
});

export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const userId = authReq.user!.id;

  const notification = await prisma.notification.findUnique({ where: { id } });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError('Not authorized', 403);
  }

  await prisma.notification.delete({ where: { id } });

  return res.status(204).send();
});
