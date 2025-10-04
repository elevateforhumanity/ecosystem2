import request from 'supertest';
import app from '../../index';
import { prisma } from '../setup';

describe('Admin Flow Integration Tests', () => {
  let adminToken: string;
  let studentToken: string;
  let instructorToken: string;

  beforeEach(async () => {
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin',
        role: 'admin',
      });
    adminToken = adminRes.body.token;

    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student@example.com',
        password: 'password123',
        name: 'Student',
        role: 'student',
      });
    studentToken = studentRes.body.token;

    const instructorRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'instructor@example.com',
        password: 'password123',
        name: 'Instructor',
        role: 'instructor',
      });
    instructorToken = instructorRes.body.token;
  });

  describe('Admin Dashboard', () => {
    it('should access admin dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('overview');
      expect(res.body.overview).toHaveProperty('totalUsers');
      expect(res.body.overview).toHaveProperty('activeCourses');
    });

    it('should not allow non-admin to access dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('User Management', () => {
    it('should get all users as admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body.users.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=student')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users.every((u: any) => u.role === 'student')).toBe(true);
    });

    it('should search users', async () => {
      const res = await request(app)
        .get('/api/admin/users?search=student')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users.length).toBeGreaterThan(0);
    });

    it('should update user role', async () => {
      const users = await prisma.user.findFirst({
        where: { email: 'student@example.com' },
      });

      const res = await request(app)
        .put(`/api/admin/users/${users!.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'instructor',
        });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('instructor');
    });

    it('should not allow student to update users', async () => {
      const users = await prisma.user.findFirst({
        where: { email: 'instructor@example.com' },
      });

      const res = await request(app)
        .put(`/api/admin/users/${users!.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          role: 'admin',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('Content Moderation', () => {
    let courseId: string;

    beforeEach(async () => {
      const courseRes = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Test Course',
          description: 'Test Description',
          category: 'Programming',
          level: 'beginner',
          price: 99.99,
          published: true,
        });
      courseId = courseRes.body.id;
    });

    it('should allow admin to unpublish course', async () => {
      const res = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          published: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.published).toBe(false);
    });

    it('should allow admin to delete any course', async () => {
      const res = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
