import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

// Prisma error handling commented out - using raw PostgreSQL for WIOA compliance
// const handlePrismaError = (err: any): AppError => {
//   switch (err.code) {
//     case 'P2002':
//       return new AppError(
//         `Duplicate field value: ${(err.meta?.target as string[])?.join(', ')}`,
//         409,
//         'DUPLICATE_FIELD'
//       );
//     case 'P2025':
//       return new NotFoundError('Record');
//     case 'P2003':
//       return new AppError('Foreign key constraint failed', 400, 'FOREIGN_KEY_ERROR');
//     case 'P2014':
//       return new AppError('Invalid relation', 400, 'INVALID_RELATION');
//     default:
//       return new AppError('Database error', 500, 'DATABASE_ERROR');
//   }
// };

const handleJWTError = (): AppError => {
  return new UnauthorizedError('Invalid token');
};

const handleJWTExpiredError = (): AppError => {
  return new UnauthorizedError('Token expired');
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = err;

  // Prisma error handling commented out - using raw PostgreSQL
  // if (err instanceof Prisma.PrismaClientKnownRequestError) {
  //   error = handlePrismaError(err);
  // } else 
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (err.name === 'ValidationError') {
    error = new AppError(err.message, 400, 'VALIDATION_ERROR');
  } else if (err.name === 'CastError') {
    error = new AppError('Invalid ID format', 400, 'INVALID_ID');
  }

  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
      errors: error.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  console.error('Unexpected error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack,
    }),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.originalUrl}`));
};

export const handleUncaughtException = () => {
  process.on('uncaughtException', (err: Error) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
  });
};

export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (err: Error) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
  });
};
