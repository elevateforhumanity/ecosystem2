import { Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getBadges: RequestHandler = async (req: Request, res: Response) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: badges });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserBadges: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: { awardedAt: 'desc' }
    });

    res.json({ success: true, data: userBadges });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const awardBadge: RequestHandler = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { userId, badgeCode } = req.body;

    if (!authReq.user || (authReq.user.role !== 'admin' && authReq.user.role !== 'instructor')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const badge = await prisma.badge.findUnique({
      where: { code: badgeCode }
    });

    if (!badge) {
      return res.status(404).json({ success: false, error: 'Badge not found' });
    }

    // Check if user already has this badge
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id
        }
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'User already has this badge' });
    }

    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
        awardedBy: authReq.user.id
      },
      include: {
        badge: true
      }
    });

    // Award points if badge has points
    if (badge.points > 0) {
      await prisma.pointsLedger.create({
        data: {
          userId,
          delta: badge.points,
          reason: `Badge awarded: ${badge.name}`,
          source: 'badge',
          sourceId: badge.id
        }
      });

      // Update leaderboard
      await updateLeaderboard(userId);
    }

    res.status(201).json({ success: true, data: userBadge });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserPoints: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const points = await prisma.pointsLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const total = points.reduce((sum, entry) => sum + entry.delta, 0);

    res.json({
      success: true,
      data: {
        total,
        history: points
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addPoints: RequestHandler = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { userId, delta, reason, source, sourceId } = req.body;

    if (!authReq.user || (authReq.user.role !== 'admin' && authReq.user.role !== 'instructor')) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const entry = await prisma.pointsLedger.create({
      data: {
        userId,
        delta: Number(delta),
        reason,
        source: source || 'manual',
        sourceId
      }
    });

    // Update leaderboard
    await updateLeaderboard(userId);

    res.status(201).json({ success: true, data: entry });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLeaderboard: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await prisma.leaderboard.findMany({
      take: Number(limit),
      orderBy: { totalPoints: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json({ success: true, data: leaderboard });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserRank: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userLeaderboard = await prisma.leaderboard.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!userLeaderboard) {
      return res.status(404).json({ success: false, error: 'User not found in leaderboard' });
    }

    res.json({ success: true, data: userLeaderboard });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to update leaderboard
async function updateLeaderboard(userId: string) {
  const points = await prisma.pointsLedger.findMany({
    where: { userId }
  });

  const totalPoints = points.reduce((sum, entry) => sum + entry.delta, 0);

  await prisma.leaderboard.upsert({
    where: { userId },
    update: { totalPoints },
    create: { userId, totalPoints }
  });

  // Update ranks
  const allUsers = await prisma.leaderboard.findMany({
    orderBy: { totalPoints: 'desc' }
  });

  for (let i = 0; i < allUsers.length; i++) {
    await prisma.leaderboard.update({
      where: { userId: allUsers[i].userId },
      data: { rank: i + 1 }
    });
  }
}
