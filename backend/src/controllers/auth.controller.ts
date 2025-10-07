import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};

const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  );
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role = 'user' } = req.body;

  if (!email || !password || !name) {
    throw new AppError('Email, password, and name are required', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: role as any,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const token = generateToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  return res.status(201).json({
    user,
    token,
    refreshToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const token = generateToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
    refreshToken,
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken) {
    await prisma.session.deleteMany({
      where: { token: refreshToken },
    });
  }

  res.json({ message: 'Logged out successfully' });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 400);
  }

  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const newToken = generateToken(session.user.id, session.user.email, session.user.role);

    res.json({ token: newToken });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      avatarUrl: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
});
