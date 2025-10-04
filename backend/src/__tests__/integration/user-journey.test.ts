import request from 'supertest';
import app from '../../index';
import { prisma } from '../setup';

describe('User Journey Integration Tests', () => {
  describe('Complete Student Journey', () => {
    let studentToken: string;
    let instructorToken: string;
    let courseId: string;
    let enrollmentId: string;
    let lessonId: string;

    it('should complete full student journey', async () => {
      const instructorRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'instructor@example.com',
          password: 'password123',
          name: 'Instructor',
          role: 'instructor',
        });
      instructorToken = instructorRes.body.token;
      expect(instructorRes.status).toBe(201);

      const courseRes = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Full Stack Development',
          description: 'Learn full stack development',
          category: 'Programming',
          level: 'intermediate',
          price: 199.99,
          published: true,
        });
      courseId = courseRes.body.id;
      expect(courseRes.status).toBe(201);

      const lessonRes = await request(app)
        .post(`/api/courses/${courseId}/lessons`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Introduction to React',
          content: 'Learn React basics',
          order: 1,
          duration: 60,
        });
      lessonId = lessonRes.body.id;
      expect(lessonRes.status).toBe(201);

      const studentRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'student@example.com',
          password: 'password123',
          name: 'Student',
          role: 'student',
        });
      studentToken = studentRes.body.token;
      expect(studentRes.status).toBe(201);

      const searchRes = await request(app)
        .get('/api/search?q=Full Stack');
      expect(searchRes.status).toBe(200);
      expect(searchRes.body.results.length).toBeGreaterThan(0);

      const courseDetailRes = await request(app)
        .get(`/api/courses/${courseId}`);
      expect(courseDetailRes.status).toBe(200);
      expect(courseDetailRes.body.title).toBe('Full Stack Development');

      const enrollRes = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId });
      enrollmentId = enrollRes.body.id;
      expect(enrollRes.status).toBe(201);

      const progressRes = await request(app)
        .post('/api/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          enrollmentId,
          lessonId,
          completed: true,
          timeSpent: 60,
        });
      expect(progressRes.status).toBe(201);

      const enrollmentDetailRes = await request(app)
        .get(`/api/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(enrollmentDetailRes.status).toBe(200);
      expect(enrollmentDetailRes.body.progress).toBeGreaterThan(0);

      const certificateRes = await request(app)
        .post('/api/certificates')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId });
      expect(certificateRes.status).toBe(201);
      expect(certificateRes.body).toHaveProperty('certificateId');
    });
  });

  describe('Complete Instructor Journey', () => {
    let instructorToken: string;
    let courseId: string;

    it('should complete full instructor journey', async () => {
      const instructorRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'instructor@example.com',
          password: 'password123',
          name: 'Instructor',
          role: 'instructor',
        });
      instructorToken = instructorRes.body.token;
      expect(instructorRes.status).toBe(201);

      const courseRes = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Advanced JavaScript',
          description: 'Master JavaScript',
          category: 'Programming',
          level: 'advanced',
          price: 299.99,
          published: false,
        });
      courseId = courseRes.body.id;
      expect(courseRes.status).toBe(201);

      const lesson1Res = await request(app)
        .post(`/api/courses/${courseId}/lessons`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Closures and Scope',
          content: 'Deep dive into closures',
          order: 1,
          duration: 45,
        });
      expect(lesson1Res.status).toBe(201);

      const lesson2Res = await request(app)
        .post(`/api/courses/${courseId}/lessons`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Async Programming',
          content: 'Promises and async/await',
          order: 2,
          duration: 60,
        });
      expect(lesson2Res.status).toBe(201);

      const updateRes = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          published: true,
        });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.published).toBe(true);

      const coursesRes = await request(app)
        .get('/api/courses?instructor=me')
        .set('Authorization', `Bearer ${instructorToken}`);
      expect(coursesRes.status).toBe(200);
      expect(coursesRes.body.courses.length).toBeGreaterThan(0);
    });
  });

  describe('Payment Flow Integration', () => {
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

      const courseRes = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorRes.body.token}`)
        .send({
          title: 'Paid Course',
          description: 'Premium content',
          category: 'Programming',
          level: 'intermediate',
          price: 99.99,
          published: true,
        });
      courseId = courseRes.body.id;

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

    it('should complete payment and enrollment flow', async () => {
      const paymentIntentRes = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          amount: 9999,
          currency: 'usd',
          metadata: { courseId },
        });
      expect(paymentIntentRes.status).toBe(200);
      expect(paymentIntentRes.body).toHaveProperty('clientSecret');

      const enrollRes = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId });
      expect(enrollRes.status).toBe(201);

      const paymentsRes = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(paymentsRes.status).toBe(200);
    });
  });
});
