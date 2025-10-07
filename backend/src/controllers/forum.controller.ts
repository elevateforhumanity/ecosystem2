import { Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getCategories: RequestHandler = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.forumCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        threads: {
          take: 5,
          orderBy: { updatedAt: 'desc' }
        }
      }
    });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getThreads: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    const threads = await prisma.forumThread.findMany({
      where: categoryId ? { categoryId: categoryId as string } : undefined,
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true }
        },
        posts: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ]
    });
    res.json({ success: true, data: threads });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createThread: RequestHandler = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { categoryId, title, content } = req.body;
    
    if (!authReq.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const thread = await prisma.forumThread.create({
      data: {
        categoryId,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        authorId: authReq.user.id,
        posts: {
          create: {
            authorId: authReq.user.id,
            content
          }
        }
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true }
        },
        posts: true
      }
    });

    res.status(201).json({ success: true, data: thread });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getThread: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Increment view count
    await prisma.forumThread.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    const thread = await prisma.forumThread.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true }
        },
        posts: {
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    res.json({ success: true, data: thread });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPost: RequestHandler = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { threadId } = req.params;
    const { content } = req.body;

    if (!authReq.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Check if thread is locked
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    if (thread.isLocked) {
      return res.status(403).json({ success: false, error: 'Thread is locked' });
    }

    const post = await prisma.forumPost.create({
      data: {
        threadId,
        authorId: authReq.user.id,
        content
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });

    // Update thread's updatedAt
    await prisma.forumThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePost: RequestHandler = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!authReq.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.authorId !== authReq.user.id && authReq.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id },
      data: {
        content,
        isEdited: true
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });

    res.json({ success: true, data: updatedPost });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deletePost: RequestHandler = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;

    if (!authReq.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.authorId !== authReq.user.id && authReq.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await prisma.forumPost.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Post deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
