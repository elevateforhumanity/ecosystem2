import request from 'supertest';
import app from '../index';
import { prisma } from './setup';

describe('Enrollment Endpoints', () => {
  let instructorToken: string;
  let studentToken: string;
  let courseId: string;

  beforeEach(async () => {
    const instructorRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'instructor@example.com',
        password: 'password123',
        name: 'Instructor',
        role: 'instructor',
      });
    instructorToken = instructorRes.body.token;

    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student@example.com',
        password: 'password123',
        name: 'Student',
        role: 'student',
      });
    studentToken = studentRes.body.token;

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

  describe('POST /api/enrollments', () => {
    it('should enroll student in course', async () => {
      const res = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('courseId', courseId);
      expect(res.body).toHaveProperty('status', 'active');
    });

    it('should not enroll without authentication', async () => {
      const res = await request(app)
        .post('/api/enrollments')
        .send({
          courseId,
        });

      expect(res.status).toBe(401);
    });

    it('should not enroll in non-existent course', async () => {
      const res = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId: 'nonexistent-id',
        });

      expect(res.status).toBe(404);
    });

    it('should not enroll twice in same course', async () => {
      await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
        });

      const res = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
        });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/enrollments', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
        });
    });

    it('should get user enrollments', async () => {
      const res = await request(app)
        .get('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.enrollments).toHaveLength(1);
      expect(res.body.enrollments[0]).toHaveProperty('courseId', courseId);
    });

    it('should not get enrollments without authentication', async () => {
      const res = await request(app).get('/api/enrollments');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/enrollments/:id', () => {
    let enrollmentId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
        });
      enrollmentId = res.body.id;
    });

    it('should get enrollment by id', async () => {
      const res = await request(app)
        .get(`/api/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', enrollmentId);
    });

    it('should not get another user enrollment', async () => {
      const res = await request(app)
        .get(`/api/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(403);
    });
  });
});
