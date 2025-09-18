import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      // Check if SMTP is configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        this.logger.error('SMTP not configured! Please configure SMTP settings in .env file');
        throw new Error('Email service not configured. Please contact the administrator.');
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Admin'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset OTP - LANMIC Admin',
        html: this.getOtpEmailTemplate(otp),
        text: `Your password reset OTP is: ${otp}. This code will expire in 10 minutes.`,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent successfully to ${email}. Message ID: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      
      // For development, also log to console
      console.log(`\n=== OTP EMAIL (SMTP FAILED) ===`);
      console.log(`To: ${email}`);
      console.log(`Subject: Password Reset OTP`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Expires in: 10 minutes`);
      console.log(`Error: ${error.message}`);
      console.log(`===============================\n`);
      
      // Re-throw the error so the user knows email sending failed
      throw new Error('Failed to send OTP email. Please try again or contact the administrator.');
    }
  }

  async sendPasswordResetSuccessEmail(email: string): Promise<void> {
    try {
      // Check if SMTP is configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        this.logger.warn('SMTP not configured, skipping success email');
        return; // Don't throw error for success email, just skip it
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Admin'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Successful - LANMIC Admin',
        html: this.getPasswordResetSuccessTemplate(),
        text: 'Your password has been successfully reset. You can now log in with your new password.',
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset success email sent to ${email}. Message ID: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset success email to ${email}:`, error);
      
      // For development, also log to console
      console.log(`\n=== PASSWORD RESET SUCCESS EMAIL (SMTP FAILED) ===`);
      console.log(`To: ${email}`);
      console.log(`Subject: Password Reset Successful`);
      console.log(`Your password has been successfully reset.`);
      console.log(`Error: ${error.message}`);
      console.log(`===============================================\n`);
      
      // Don't throw error for success email, just log it
    }
  }

  private getOtpEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-number { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>LANMIC Admin Panel</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>You have requested to reset your password for the LANMIC Admin Panel. Use the OTP code below to proceed with resetting your password.</p>
            
            <div class="otp-code">
              <p style="margin: 0 0 10px 0; color: #666;">Your OTP Code:</p>
              <div class="otp-number">${otp}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>This code will expire in <strong>10 minutes</strong></li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions or concerns, please contact the system administrator.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LANMIC Admin Panel. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetSuccessTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
            <p>LANMIC Admin Panel</p>
          </div>
          <div class="content">
            <div class="success-icon">🎉</div>
            <h2>Great news!</h2>
            <p>Your password has been successfully reset. You can now log in to the LANMIC Admin Panel using your new password.</p>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Visit the admin login page</li>
              <li>Enter your email and new password</li>
              <li>Access your admin dashboard</li>
            </ul>
            
            <p>If you have any questions or need assistance, please contact the system administrator.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LANMIC Admin Panel. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
