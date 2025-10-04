import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on('join:course', (courseId: string) => {
      socket.join(`course:${courseId}`);
      console.log(`User ${socket.userId} joined course ${courseId}`);
    });

    socket.on('leave:course', (courseId: string) => {
      socket.leave(`course:${courseId}`);
      console.log(`User ${socket.userId} left course ${courseId}`);
    });

    socket.on('chat:message', (data: { courseId: string; message: string }) => {
      io.to(`course:${data.courseId}`).emit('chat:message', {
        userId: socket.userId,
        message: data.message,
        timestamp: new Date(),
      });
    });

    socket.on('progress:update', (data: { courseId: string; lessonId: string; progress: number }) => {
      io.to(`course:${data.courseId}`).emit('progress:update', {
        userId: socket.userId,
        lessonId: data.lessonId,
        progress: data.progress,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export type SocketServer = ReturnType<typeof initializeSocket>;
