import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  const deleteUsers = prisma.user.deleteMany();
  const deleteCourses = prisma.course.deleteMany();
  const deleteEnrollments = prisma.enrollment.deleteMany();
  
  await prisma.$transaction([
    deleteEnrollments,
    deleteCourses,
    deleteUsers,
  ]);
});

export { prisma };
