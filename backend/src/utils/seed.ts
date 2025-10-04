import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@elevate.com' },
    update: {},
    create: {
      email: 'admin@elevate.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      emailVerified: true,
    },
  });
  console.log('✅ Created admin user');

  const instructor1 = await prisma.user.upsert({
    where: { email: 'john.doe@elevate.com' },
    update: {},
    create: {
      email: 'john.doe@elevate.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'instructor',
      emailVerified: true,
      bio: 'Full-stack developer with 10+ years of experience',
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: 'jane.smith@elevate.com' },
    update: {},
    create: {
      email: 'jane.smith@elevate.com',
      password: hashedPassword,
      name: 'Jane Smith',
      role: 'instructor',
      emailVerified: true,
      bio: 'UI/UX designer and frontend specialist',
    },
  });
  console.log('✅ Created instructor users');

  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i}@elevate.com` },
      update: {},
      create: {
        email: `student${i}@elevate.com`,
        password: hashedPassword,
        name: `Student ${i}`,
        role: 'student',
        emailVerified: true,
      },
    });
    students.push(student);
  }
  console.log('✅ Created student users');

  const course1 = await prisma.course.create({
    data: {
      title: 'Complete Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js, and more',
      category: 'Programming',
      level: 'beginner',
      price: 199.99,
      published: true,
      instructorId: instructor1.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      lessons: {
        create: [
          {
            title: 'Introduction to Web Development',
            content: 'Overview of web development technologies',
            order: 1,
            duration: 30,
          },
          {
            title: 'HTML Fundamentals',
            content: 'Learn HTML tags and structure',
            order: 2,
            duration: 45,
          },
          {
            title: 'CSS Styling',
            content: 'Master CSS for beautiful designs',
            order: 3,
            duration: 60,
          },
          {
            title: 'JavaScript Basics',
            content: 'Introduction to JavaScript programming',
            order: 4,
            duration: 90,
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Advanced React Development',
      description: 'Master React hooks, context, and advanced patterns',
      category: 'Programming',
      level: 'advanced',
      price: 299.99,
      published: true,
      instructorId: instructor1.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
      lessons: {
        create: [
          {
            title: 'React Hooks Deep Dive',
            content: 'Master useState, useEffect, and custom hooks',
            order: 1,
            duration: 120,
          },
          {
            title: 'Context API and State Management',
            content: 'Learn global state management',
            order: 2,
            duration: 90,
          },
          {
            title: 'Performance Optimization',
            content: 'Optimize React applications',
            order: 3,
            duration: 75,
          },
        ],
      },
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'UI/UX Design Masterclass',
      description: 'Learn design principles, Figma, and user research',
      category: 'Design',
      level: 'intermediate',
      price: 149.99,
      published: true,
      instructorId: instructor2.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
      lessons: {
        create: [
          {
            title: 'Design Principles',
            content: 'Fundamental design principles',
            order: 1,
            duration: 60,
          },
          {
            title: 'Figma Basics',
            content: 'Getting started with Figma',
            order: 2,
            duration: 90,
          },
          {
            title: 'User Research Methods',
            content: 'Conducting effective user research',
            order: 3,
            duration: 75,
          },
        ],
      },
    },
  });

  const course4 = await prisma.course.create({
    data: {
      title: 'Data Science with Python',
      description: 'Learn Python, pandas, NumPy, and machine learning',
      category: 'Data Science',
      level: 'intermediate',
      price: 249.99,
      published: true,
      instructorId: instructor1.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      lessons: {
        create: [
          {
            title: 'Python for Data Science',
            content: 'Python basics for data analysis',
            order: 1,
            duration: 90,
          },
          {
            title: 'Pandas and NumPy',
            content: 'Data manipulation with pandas',
            order: 2,
            duration: 120,
          },
          {
            title: 'Data Visualization',
            content: 'Creating charts and graphs',
            order: 3,
            duration: 75,
          },
        ],
      },
    },
  });
  console.log('✅ Created courses with lessons');

  for (const student of students.slice(0, 3)) {
    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course1.id,
        status: 'active',
      },
    });
  }

  await prisma.enrollment.create({
    data: {
      userId: students[0].id,
      courseId: course2.id,
      status: 'active',
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: students[1].id,
      courseId: course3.id,
      status: 'completed',
    },
  });
  console.log('✅ Created enrollments');

  await prisma.review.create({
    data: {
      userId: students[0].id,
      courseId: course1.id,
      rating: 5,
      comment: 'Excellent course! Very comprehensive and well-structured.',
    },
  });

  await prisma.review.create({
    data: {
      userId: students[1].id,
      courseId: course1.id,
      rating: 4,
      comment: 'Great content, but could use more practical examples.',
    },
  });

  await prisma.review.create({
    data: {
      userId: students[2].id,
      courseId: course2.id,
      rating: 5,
      comment: 'Best React course I have taken. Highly recommended!',
    },
  });

  await prisma.review.create({
    data: {
      userId: students[1].id,
      courseId: course3.id,
      rating: 5,
      comment: 'Amazing design course. Learned so much about UI/UX.',
    },
  });
  console.log('✅ Created reviews');

  await prisma.notification.create({
    data: {
      userId: students[0].id,
      type: 'course_update',
      title: 'New lesson added',
      message: 'A new lesson has been added to Complete Web Development Bootcamp',
    },
  });

  await prisma.notification.create({
    data: {
      userId: students[1].id,
      type: 'achievement',
      title: 'Course completed!',
      message: 'Congratulations on completing UI/UX Design Masterclass',
    },
  });
  console.log('✅ Created notifications');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('Admin: admin@elevate.com / password123');
  console.log('Instructor: john.doe@elevate.com / password123');
  console.log('Student: student1@elevate.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
