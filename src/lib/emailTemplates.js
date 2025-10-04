const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .header {
    background-color: #007bff;
    color: #ffffff;
    padding: 30px 20px;
    text-align: center;
  }
  .header h1 {
    margin: 0;
    font-size: 28px;
  }
  .content {
    padding: 40px 30px;
  }
  .button {
    display: inline-block;
    padding: 12px 30px;
    background-color: #007bff;
    color: #ffffff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 20px 0;
  }
  .footer {
    background-color: #f8f9fa;
    padding: 20px 30px;
    text-align: center;
    font-size: 14px;
    color: #6c757d;
  }
  .footer a {
    color: #007bff;
    text-decoration: none;
  }
`;

export const emailTemplates = {
  welcome: ({ name, loginUrl }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Elevate for Humanity</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Elevate for Humanity! 🎉</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We're thrilled to have you join our learning community! Your account has been successfully created.</p>
          <p>At Elevate for Humanity, you'll have access to:</p>
          <ul>
            <li>📚 Hundreds of courses across various topics</li>
            <li>🎓 Industry-recognized certificates</li>
            <li>👥 A supportive community of learners</li>
            <li>📊 Track your progress and achievements</li>
          </ul>
          <p>Ready to start learning?</p>
          <a href="${loginUrl}" class="button">Get Started</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Happy learning!</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Elevate for Humanity. All rights reserved.</p>
          <p><a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a></p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: ({ name, resetUrl, expiresIn }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request 🔐</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>This link will expire in ${expiresIn || '1 hour'}.</p>
          <p><strong>If you didn't request this,</strong> you can safely ignore this email. Your password will remain unchanged.</p>
          <p>For security reasons, never share this link with anyone.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Elevate for Humanity. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  courseEnrollment: ({ name, courseName, courseUrl, instructorName }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Course Enrollment Confirmation</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Enrolled! 🎓</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Great news! You've successfully enrolled in <strong>${courseName}</strong>.</p>
          ${instructorName ? `<p>This course is taught by ${instructorName}.</p>` : ''}
          <p>You can start learning right away by accessing your course dashboard.</p>
          <a href="${courseUrl}" class="button">Start Learning</a>
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Complete the course at your own pace</li>
            <li>Engage with course materials and assignments</li>
            <li>Earn your certificate upon completion</li>
          </ul>
          <p>We're excited to support you on your learning journey!</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Elevate for Humanity. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  certificateEarned: ({ name, courseName, certificateUrl, certificateId }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Congratulations on Your Achievement!</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Congratulations! 🏆</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We're proud to announce that you've successfully completed <strong>${courseName}</strong>!</p>
          <p>Your certificate is now ready to download and share with your network.</p>
          <a href="${certificateUrl}" class="button">Download Certificate</a>
          <p><strong>Certificate ID:</strong> ${certificateId}</p>
          <p>Share your achievement on social media and let others know about your accomplishment!</p>
          <p>Keep up the great work and continue your learning journey with us.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Elevate for Humanity. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  assignmentReminder: ({ name, courseName, assignmentName, dueDate, courseUrl }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Assignment Reminder</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Assignment Reminder ⏰</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>This is a friendly reminder that your assignment <strong>${assignmentName}</strong> for <strong>${courseName}</strong> is due soon.</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p>Make sure to submit your work before the deadline to receive full credit.</p>
          <a href="${courseUrl}" class="button">View Assignment</a>
          <p>If you need any help, don't hesitate to reach out to your instructor or our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Elevate for Humanity. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  instructorApproval: ({ name, dashboardUrl }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Instructor Application Approved</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome, Instructor! 👨‍🏫</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Congratulations! Your instructor application has been approved.</p>
          <p>You can now create and publish courses on our platform. Here's what you can do:</p>
          <ul>
            <li>📝 Create engaging course content</li>
            <li>📹 Upload video lessons</li>
            <li>📊 Track student progress</li>
            <li>💬 Interact with your students</li>
          </ul>
          <a href="${dashboardUrl}" class="button">Go to Instructor Dashboard</a>
          <p>We're excited to have you as part of our teaching community!</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Elevate for Humanity. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  weeklyDigest: ({ name, stats, recommendedCourses, dashboardUrl }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Weekly Learning Digest</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Weekly Digest 📊</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Here's a summary of your learning activity this week:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Lessons Completed:</strong> ${stats?.lessonsCompleted || 0}</p>
            <p><strong>Time Spent Learning:</strong> ${stats?.timeSpent || '0 hours'}</p>
            <p><strong>Courses In Progress:</strong> ${stats?.coursesInProgress || 0}</p>
          </div>
          ${recommendedCourses && recommendedCourses.length > 0 ? `
            <p><strong>Recommended for you:</strong></p>
            <ul>
              ${recommendedCourses.map(course => `<li>${course}</li>`).join('')}
            </ul>
          ` : ''}
          <a href="${dashboardUrl}" class="button">View Dashboard</a>
          <p>Keep up the great work!</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Elevate for Humanity. All rights reserved.</p>
          <p><a href="#">Unsubscribe</a> | <a href="#">Email Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
};

export function sendEmail(template, data) {
  if (!emailTemplates[template]) {
    throw new Error(`Email template "${template}" not found`);
  }

  const html = emailTemplates[template](data);
  
  return {
    html,
    subject: getSubject(template, data),
  };
}

function getSubject(template, data) {
  const subjects = {
    welcome: 'Welcome to Elevate for Humanity!',
    passwordReset: 'Reset Your Password',
    courseEnrollment: `You're enrolled in ${data.courseName}`,
    certificateEarned: `Congratulations! You've earned a certificate`,
    assignmentReminder: `Reminder: ${data.assignmentName} is due soon`,
    instructorApproval: 'Your instructor application has been approved',
    weeklyDigest: 'Your Weekly Learning Digest',
  };

  return subjects[template] || 'Notification from Elevate for Humanity';
}
