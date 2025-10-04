import nodemailer from 'nodemailer';
import { logger } from '../middleware/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      logger.warn('Email service not configured. Emails will not be sent.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    logger.info('Email service initialized');
  }

  async send(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email service not configured. Email not sent.', { to: options.to });
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@elevate.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      logger.info('Email sent successfully', { to: options.to, subject: options.subject });
      return true;
    } catch (error) {
      logger.error('Email send error', { to: options.to, error });
      return false;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Elevate for Humanity!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for joining Elevate for Humanity! We're excited to have you as part of our learning community.</p>
              <p>With Elevate, you can:</p>
              <ul>
                <li>Access thousands of courses across various topics</li>
                <li>Learn at your own pace with flexible scheduling</li>
                <li>Earn certificates upon course completion</li>
                <li>Connect with instructors and fellow learners</li>
              </ul>
              <p>Ready to start learning?</p>
              <a href="${process.env.FRONTEND_URL}/courses" class="button">Browse Courses</a>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy learning!</p>
              <p><strong>The Elevate Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Elevate for Humanity. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: 'Welcome to Elevate for Humanity!',
      html,
      text: `Hello ${name}, Welcome to Elevate for Humanity! Thank you for joining our learning community.`,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password for your Elevate account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <div class="warning">
                <p><strong>Security Notice:</strong></p>
                <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: 'Reset Your Password - Elevate for Humanity',
      html,
      text: `Hello ${name}, Click this link to reset your password: ${resetUrl}`,
    });
  }

  async sendCourseEnrollmentEmail(to: string, name: string, courseTitle: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Enrollment Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Congratulations! You've successfully enrolled in:</p>
              <h3 style="color: #667eea;">${courseTitle}</h3>
              <p>You can now access all course materials and start learning right away.</p>
              <a href="${process.env.FRONTEND_URL}/my-courses" class="button">Start Learning</a>
              <p>Good luck with your studies!</p>
              <p><strong>The Elevate Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `Enrollment Confirmed: ${courseTitle}`,
      html,
      text: `Hello ${name}, You've successfully enrolled in ${courseTitle}. Start learning now!`,
    });
  }

  async sendCertificateEmail(to: string, name: string, courseTitle: string, certificateUrl: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏆 Congratulations!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Congratulations on completing:</p>
              <h3 style="color: #667eea;">${courseTitle}</h3>
              <p>Your certificate of completion is now available!</p>
              <a href="${certificateUrl}" class="button">Download Certificate</a>
              <p>Share your achievement with your network and continue your learning journey!</p>
              <p><strong>The Elevate Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `Certificate Earned: ${courseTitle}`,
      html,
      text: `Congratulations ${name}! You've earned a certificate for completing ${courseTitle}. Download it here: ${certificateUrl}`,
    });
  }
}

export const emailService = new EmailService();
