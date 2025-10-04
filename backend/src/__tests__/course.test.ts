import request from 'supertest';
import app from '../index';
import { prisma } from './setup';

describe('Course Endpoints', () => {
  let instructorToken: string;
  let studentToken: string;
  let instructorId: string;

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
    instructorId = instructorRes.body.user.id;

    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student@example.com',
        password: 'password123',
        name: 'Student',
        role: 'student',
      });
    studentToken = studentRes.body.token;
  });

  describe('POST /api/courses', () => {
    it('should create a course as instructor', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Test Course',
          description: 'Test Description',
          category: 'Programming',
          level: 'beginner',
          price: 99.99,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', 'Test Course');
      expect(res.body).toHaveProperty('instructorId', instructorId);
    });

    it('should not create course without authentication', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({
          title: 'Test Course',
          description: 'Test Description',
        });

      expect(res.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Test Course',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/courses', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Course 1',
          description: 'Description 1',
          category: 'Programming',
          level: 'beginner',
          price: 99.99,
          published: true,
        });

      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Course 2',
          description: 'Description 2',
          category: 'Design',
          level: 'intermediate',
          price: 149.99,
          published: true,
        });
    });

    it('should get all published courses', async () => {
      const res = await request(app).get('/api/courses');

      expect(res.status).toBe(200);
      expect(res.body.courses).toHaveLength(2);
    });

    it('should filter courses by category', async () => {
      const res = await request(app).get('/api/courses?category=Programming');

      expect(res.status).toBe(200);
      expect(res.body.courses).toHaveLength(1);
      expect(res.body.courses[0]).toHaveProperty('category', 'Programming');
    });

    it('should filter courses by level', async () => {
      const res = await request(app).get('/api/courses?level=beginner');

      expect(res.status).toBe(200);
      expect(res.body.courses).toHaveLength(1);
      expect(res.body.courses[0]).toHaveProperty('level', 'beginner');
    });
  });

  describe('GET /api/courses/:id', () => {
    let courseId: string;

    beforeEach(async () => {
      const res = await request(app)
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
      courseId = res.body.id;
    });

    it('should get course by id', async () => {
      const res = await request(app).get(`/api/courses/${courseId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', courseId);
      expect(res.body).toHaveProperty('title', 'Test Course');
    });

    it('should return 404 for non-existent course', async () => {
      const res = await request(app).get('/api/courses/nonexistent-id');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/courses/:id', () => {
    let courseId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Test Course',
          description: 'Test Description',
          category: 'Programming',
          level: 'beginner',
          price: 99.99,
        });
      courseId = res.body.id;
    });

    it('should update course as instructor', async () => {
      const res = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Updated Course',
          price: 149.99,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'Updated Course');
      expect(res.body).toHaveProperty('price', 149.99);
    });

    it('should not update course as student', async () => {
      const res = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Updated Course',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    let courseId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Test Course',
          description: 'Test Description',
          category: 'Programming',
          level: 'beginner',
          price: 99.99,
        });
      courseId = res.body.id;
    });

    it('should delete course as instructor', async () => {
      const res = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);

      const getRes = await request(app).get(`/api/courses/${courseId}`);
      expect(getRes.status).toBe(404);
    });

    it('should not delete course as student', async () => {
      const res = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });
});
