import { Response } from 'express';
import prisma from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getCertificates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const certificates = await prisma.certificate.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          instructor: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { issuedAt: 'desc' },
  });

  res.json({ certificates });
});

export const getCertificateById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true },
      },
      course: {
        select: {
          title: true,
          instructor: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }

  if (certificate.userId !== userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorized to view this certificate', 403);
  }

  res.json(certificate);
});

export const verifyCertificate = asyncHandler(async (req: any, res: Response): Promise<void> => {
  const { certificateId } = req.params;

  const certificate = await prisma.certificate.findUnique({
    where: { certificateId },
    include: {
      user: {
        select: { name: true },
      },
      course: {
        select: { title: true },
      },
    },
  });

  if (!certificate) {
    res.json({
      valid: false,
      message: 'Certificate not found',
    });
    return;
  }

  res.json({
    valid: true,
    studentName: certificate.user.name,
    courseName: certificate.course.title,
    completionDate: certificate.issuedAt,
    certificateId: certificate.certificateId,
  });
});
