import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isTransporterReady = false;

  constructor() {
    // Initialize transporter asynchronously
    this.initializeTransporter().catch((error) => {
      this.logger.error(
        'Failed to initialize email transporter in constructor:',
        error,
      );
    });
  }

  private async initializeTransporter() {
    try {
      // Check if SMTP is configured
      if (
        !process.env.SMTP_HOST ||
        !process.env.SMTP_PORT ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASS
      ) {
        this.logger.warn(
          'SMTP configuration incomplete. Email service will not be available.',
        );
        this.isTransporterReady = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure:
          process.env.SMTP_SECURE === 'true' ||
          parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000, // 30 seconds
        socketTimeout: 60000, // 60 seconds
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 20000, // 20 seconds
        rateLimit: 5, // max 5 messages per rateDelta
      });

      // Verify connection
      await this.verifyConnection();
      this.isTransporterReady = true;
      this.logger.log(
        'Email transporter initialized and verified successfully',
      );
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      this.isTransporterReady = false;
      this.transporter = null;
    }
  }

  private async verifyConnection(): Promise<void> {
    if (!this.transporter) {
      throw new Error('Transporter not initialized');
    }

    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error: unknown) {
      this.logger.error('SMTP connection verification failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`SMTP connection failed: ${errorMessage}`);
    }
  }

  public isEmailServiceReady(): boolean {
    return this.isTransporterReady && this.transporter !== null;
  }

  public async reconnect(): Promise<void> {
    this.logger.log('Attempting to reconnect SMTP...');
    this.isTransporterReady = false;
    this.transporter = null;
    await this.initializeTransporter();
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      // Check if transporter is ready
      if (!this.isTransporterReady || !this.transporter) {
        this.logger.error(
          'SMTP not configured or transporter not ready! Please configure SMTP settings in .env file',
        );

        // For development, log the OTP to console
        console.log(`\n=== OTP EMAIL (SMTP NOT CONFIGURED) ===`);
        console.log(`To: ${email}`);
        console.log(`Subject: Password Reset OTP`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 10 minutes`);
        console.log(`Note: SMTP not configured - email not sent`);
        console.log(`========================================\n`);

        throw new Error(
          'Email service not configured. Please contact the administrator.',
        );
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Admin'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset OTP - LANMIC Admin',
        html: this.getOtpEmailTemplate(otp),
        text: `Your password reset OTP is: ${otp}. This code will expire in 10 minutes.`,
      };

      const result = (await this.transporter.sendMail(mailOptions)) as {
        messageId?: string;
      };
      const messageId = result?.messageId || 'N/A';
      this.logger.log(
        `OTP email sent successfully to ${email}. Message ID: ${messageId}`,
      );
    } catch (error: unknown) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // For development, also log to console
      console.log(`\n=== OTP EMAIL (SMTP FAILED) ===`);
      console.log(`To: ${email}`);
      console.log(`Subject: Password Reset OTP`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Expires in: 10 minutes`);
      console.log(`Error: ${errorMessage}`);
      console.log(`===============================\n`);

      // Re-throw the error so the user knows email sending failed
      throw new Error(
        'Failed to send OTP email. Please try again or contact the administrator.',
      );
    }
  }

  async sendPasswordResetSuccessEmail(email: string): Promise<void> {
    try {
      // Check if transporter is ready
      if (!this.isTransporterReady || !this.transporter) {
        this.logger.warn(
          'SMTP not configured or transporter not ready, skipping success email',
        );

        // For development, log to console
        console.log(
          `\n=== PASSWORD RESET SUCCESS EMAIL (SMTP NOT CONFIGURED) ===`,
        );
        console.log(`To: ${email}`);
        console.log(`Subject: Password Reset Successful`);
        console.log(`Your password has been successfully reset.`);
        console.log(`Note: SMTP not configured - email not sent`);
        console.log(
          `=======================================================\n`,
        );

        return; // Don't throw error for success email, just skip it
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Admin'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Successful - LANMIC Admin',
        html: this.getPasswordResetSuccessTemplate(),
        text: 'Your password has been successfully reset. You can now log in with your new password.',
      };

      const result = (await this.transporter.sendMail(mailOptions)) as {
        messageId?: string;
      };
      const messageId = result?.messageId || 'N/A';
      this.logger.log(
        `Password reset success email sent to ${email}. Message ID: ${messageId}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send password reset success email to ${email}:`,
        error,
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // For development, also log to console
      console.log(`\n=== PASSWORD RESET SUCCESS EMAIL (SMTP FAILED) ===`);
      console.log(`To: ${email}`);
      console.log(`Subject: Password Reset Successful`);
      console.log(`Your password has been successfully reset.`);
      console.log(`Error: ${errorMessage}`);
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

  async sendRegistrationOtpEmail(email: string, otp: string): Promise<void> {
    if (!this.isTransporterReady || !this.transporter) {
      this.logger.error(
        'Email transporter is not ready. Cannot send registration OTP email.',
      );
      throw new Error('Email service is not available');
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Complete Your Registration - LANMIC Admin Panel',
        html: this.getRegistrationOtpTemplate(otp),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Registration OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send registration OTP email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    if (!this.isTransporterReady || !this.transporter) {
      this.logger.error(
        'Email transporter is not ready. Cannot send verification email.',
      );
      throw new Error('Email service is not available');
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Verify Your Email - LANMIC Admin Panel',
        html: this.getVerificationEmailTemplate(token),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  private getRegistrationOtpTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Registration</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Complete Your Registration</h1>
            <p>LANMIC Admin Panel</p>
          </div>
          <div class="content">
            <h2>Welcome to LANMIC Admin Panel!</h2>
            <p>Thank you for starting the registration process. To complete your account setup, please use the verification code below:</p>
            
            <div class="otp-code">${otp}</div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This code will expire in 10 minutes. Please enter it promptly to complete your registration.
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Enter the verification code above in the registration form</li>
              <li>Complete your profile with username and password</li>
              <li>Start using the LANMIC Admin Panel</li>
            </ol>
            
            <p>If you didn't request this registration, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LANMIC Admin Panel. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getVerificationEmailTemplate(token: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email Address</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: #28a745; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Verify Your Email</h1>
            <p>LANMIC Admin Panel</p>
          </div>
          <div class="content">
            <h2>Session Email Verification Required</h2>
            <p>For security purposes, email verification is required for each login session. Please click the button below to verify your email address:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.BACKEND_URL}/auth/verify-email/${token}" 
                 style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                ✅ Verify My Email
              </a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This verification link will expire in 10 minutes. Please click the button above to complete verification.
            </div>
            
            <p><strong>What happens next:</strong></p>
            <ol>
              <li>Click the "Verify My Email" button above</li>
              <li>You'll be redirected to your dashboard</li>
              <li>Enjoy full access to all features for this session!</li>
            </ol>
            
            <p><strong>Alternative:</strong> If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px;">
              ${process.env.BACKEND_URL}/auth/verify-email/${token}
            </p>
            
            <p>If you didn't request this verification, please contact the system administrator.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LANMIC Admin Panel. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendCurrentEmailVerificationOtp(
    email: string,
    otp: string,
  ): Promise<void> {
    try {
      // Check if transporter is ready
      if (!this.isTransporterReady || !this.transporter) {
        this.logger.error(
          'SMTP not configured or transporter not ready! Please configure SMTP settings in .env file',
        );

        // For development, log the OTP to console
        console.log(
          `\n=== CURRENT EMAIL VERIFICATION OTP (SMTP NOT CONFIGURED) ===`,
        );
        console.log(`To: ${email}`);
        console.log(`Subject: Email Change Verification - Current Email`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 10 minutes`);
        console.log(`Note: SMTP not configured - email not sent`);
        console.log(
          `============================================================\n`,
        );

        throw new Error(
          'Email service not configured. Please contact the administrator.',
        );
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Admin'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Email Change Verification - Current Email - LANMIC Admin',
        html: this.getCurrentEmailVerificationTemplate(otp),
        text: `Your current email verification OTP is: ${otp}. This code will expire in 10 minutes.`,
      };

      const result = (await this.transporter.sendMail(mailOptions)) as {
        messageId?: string;
      };
      const messageId = result?.messageId || 'N/A';
      this.logger.log(
        `Current email verification OTP sent successfully to ${email}. Message ID: ${messageId}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send current email verification OTP to ${email}:`,
        error,
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // For development, also log to console
      console.log(`\n=== CURRENT EMAIL VERIFICATION OTP (SMTP FAILED) ===`);
      console.log(`To: ${email}`);
      console.log(`Subject: Email Change Verification - Current Email`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Expires in: 10 minutes`);
      console.log(`Error: ${errorMessage}`);
      console.log(`==================================================\n`);

      // Re-throw the error so the user knows email sending failed
      throw new Error(
        'Failed to send verification email. Please try again or contact the administrator.',
      );
    }
  }

  async sendNewEmailVerificationOtp(email: string, otp: string): Promise<void> {
    try {
      // Check if transporter is ready
      if (!this.isTransporterReady || !this.transporter) {
        this.logger.error(
          'SMTP not configured or transporter not ready! Please configure SMTP settings in .env file',
        );

        // For development, log the OTP to console
        console.log(
          `\n=== NEW EMAIL VERIFICATION OTP (SMTP NOT CONFIGURED) ===`,
        );
        console.log(`To: ${email}`);
        console.log(`Subject: Email Change Verification - New Email`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 10 minutes`);
        console.log(`Note: SMTP not configured - email not sent`);
        console.log(
          `========================================================\n`,
        );

        throw new Error(
          'Email service not configured. Please contact the administrator.',
        );
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Admin'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Email Change Verification - New Email - LANMIC Admin',
        html: this.getNewEmailVerificationTemplate(otp),
        text: `Your new email verification OTP is: ${otp}. This code will expire in 10 minutes.`,
      };

      const result = (await this.transporter.sendMail(mailOptions)) as {
        messageId?: string;
      };
      const messageId = result?.messageId || 'N/A';
      this.logger.log(
        `New email verification OTP sent successfully to ${email}. Message ID: ${messageId}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send new email verification OTP to ${email}:`,
        error,
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // For development, also log to console
      console.log(`\n=== NEW EMAIL VERIFICATION OTP (SMTP FAILED) ===`);
      console.log(`To: ${email}`);
      console.log(`Subject: Email Change Verification - New Email`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Expires in: 10 minutes`);
      console.log(`Error: ${errorMessage}`);
      console.log(`===============================================\n`);

      // Re-throw the error so the user knows email sending failed
      throw new Error(
        'Failed to send verification email. Please try again or contact the administrator.',
      );
    }
  }

  async sendEmailChangeConfirmationEmail(
    newEmail: string,
    oldEmail: string,
  ): Promise<void> {
    try {
      // Check if transporter is ready
      if (!this.isTransporterReady || !this.transporter) {
        this.logger.warn(
          'SMTP not configured or transporter not ready, skipping confirmation email',
        );

        // For development, log to console
        console.log(
          `\n=== EMAIL CHANGE CONFIRMATION (SMTP NOT CONFIGURED) ===`,
        );
        console.log(`To: ${newEmail}`);
        console.log(`Subject: Email Address Changed Successfully`);
        console.log(
          `Your email address has been successfully changed from ${oldEmail} to ${newEmail}.`,
        );
        console.log(`Note: SMTP not configured - email not sent`);
        console.log(`=====================================================\n`);

        return; // Don't throw error for confirmation email, just skip it
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Admin'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: newEmail,
        subject: 'Email Address Changed Successfully - LANMIC Admin',
        html: this.getEmailChangeConfirmationTemplate(newEmail, oldEmail),
        text: `Your email address has been successfully changed from ${oldEmail} to ${newEmail}.`,
      };

      const result = (await this.transporter.sendMail(mailOptions)) as {
        messageId?: string;
      };
      const messageId = result?.messageId || 'N/A';
      this.logger.log(
        `Email change confirmation sent to ${newEmail}. Message ID: ${messageId}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send email change confirmation to ${newEmail}:`,
        error,
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // For development, also log to console
      console.log(`\n=== EMAIL CHANGE CONFIRMATION (SMTP FAILED) ===`);
      console.log(`To: ${newEmail}`);
      console.log(`Subject: Email Address Changed Successfully`);
      console.log(
        `Your email address has been successfully changed from ${oldEmail} to ${newEmail}.`,
      );
      console.log(`Error: ${errorMessage}`);
      console.log(`=============================================\n`);

      // Don't throw error for confirmation email, just log it
    }
  }

  async sendPasswordChangeConfirmationEmail(email: string): Promise<void> {
    try {
      // Check if transporter is ready
      if (!this.isTransporterReady || !this.transporter) {
        this.logger.warn(
          'SMTP not configured or transporter not ready, skipping password change confirmation email',
        );

        // For development, log to console
        console.log(
          `\n=== PASSWORD CHANGE CONFIRMATION (SMTP NOT CONFIGURED) ===`,
        );
        console.log(`To: ${email}`);
        console.log(`Subject: Password Changed Successfully`);
        console.log(
          `Your password has been successfully changed. If you did not make this change, please contact support immediately.`,
        );
        console.log(`Note: SMTP not configured - email not sent`);
        console.log(`=====================================================\n`);

        return; // Don't throw error for confirmation email, just skip it
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Admin'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Changed Successfully - LANMIC Admin',
        html: this.getPasswordChangeConfirmationTemplate(email),
        text: `Your password has been successfully changed. If you did not make this change, please contact support immediately.`,
      };

      const result = (await this.transporter.sendMail(mailOptions)) as {
        messageId?: string;
      };
      const messageId = result?.messageId || 'N/A';
      this.logger.log(
        `Password change confirmation sent to ${email}. Message ID: ${messageId}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send password change confirmation to ${email}:`,
        error,
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // For development, also log to console
      console.log(`\n=== PASSWORD CHANGE CONFIRMATION (SMTP FAILED) ===`);
      console.log(`To: ${email}`);
      console.log(`Subject: Password Changed Successfully`);
      console.log(
        `Your password has been successfully changed. If you did not make this change, please contact support immediately.`,
      );
      console.log(`Error: ${errorMessage}`);
      console.log(`=============================================\n`);

      // Don't throw error for confirmation email, just log it
    }
  }

  private getCurrentEmailVerificationTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Current Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: #fff; border: 2px dashed #ff6b6b; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-number { font-size: 32px; font-weight: bold; color: #ff6b6b; letter-spacing: 5px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Current Email Verification</h1>
            <p>LANMIC Admin Panel</p>
          </div>
          <div class="content">
            <h2>Email Change Request</h2>
            <p>You have requested to change your email address. To proceed, we need to verify that you have access to your current email address.</p>
            
            <div class="otp-code">
              <p style="margin: 0 0 10px 0; color: #666;">Your Verification Code:</p>
              <div class="otp-number">${otp}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>This code will expire in <strong>10 minutes</strong></li>
                <li>Enter this code to verify your current email</li>
                <li>After verification, you can enter your new email address</li>
                <li>If you didn't request this change, please contact the administrator</li>
              </ul>
            </div>
            
            <p>Once verified, you'll be able to enter your new email address and complete the change process.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LANMIC Admin Panel. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getNewEmailVerificationTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: #fff; border: 2px dashed #4ecdc4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-number { font-size: 32px; font-weight: bold; color: #4ecdc4; letter-spacing: 5px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Email Verification</h1>
            <p>LANMIC Admin Panel</p>
          </div>
          <div class="content">
            <h2>Verify Your New Email Address</h2>
            <p>You have requested to change your email address to this new address. To complete the change, please verify that you have access to this email.</p>
            
            <div class="otp-code">
              <p style="margin: 0 0 10px 0; color: #666;">Your Verification Code:</p>
              <div class="otp-number">${otp}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>This code will expire in <strong>10 minutes</strong></li>
                <li>Enter this code to verify your new email address</li>
                <li>After verification, you'll need to confirm with your password</li>
                <li>If you didn't request this change, please ignore this email</li>
              </ul>
            </div>
            
            <p>Once verified, you'll be able to confirm the email change with your current password.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LANMIC Admin Panel. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getEmailChangeConfirmationTemplate(
    newEmail: string,
    oldEmail: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Address Changed Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; margin: 20px 0; }
          .email-change { background: #e8f5e8; border: 1px solid #28a745; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email Address Changed Successfully</h1>
            <p>LANMIC Admin Panel</p>
          </div>
          <div class="content">
            <div class="success-icon">🎉</div>
            <h2>Email Change Confirmed!</h2>
            <p>Your email address has been successfully changed in the LANMIC Admin Panel.</p>
            
            <div class="email-change">
              <p><strong>Email Change Details:</strong></p>
              <p><strong>Previous Email:</strong> ${oldEmail}</p>
              <p><strong>New Email:</strong> ${newEmail}</p>
              <p><strong>Changed On:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Use your new email address for future logins</li>
              <li>All future notifications will be sent to this new address</li>
              <li>Your account security remains unchanged</li>
            </ul>
            
            <p>If you didn't request this change, please contact the system administrator immediately.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LANMIC Admin Panel. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordChangeConfirmationTemplate(email: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .footer { background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 12px; }
          .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Changed Successfully</h1>
          </div>
          <div class="content">
            <div class="success">
              <h2>✅ Password Update Confirmed</h2>
              <p>Your password has been successfully changed for your LANMIC Admin account.</p>
            </div>
            
            <p><strong>Account Details:</strong></p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>Status:</strong> Password successfully updated</li>
            </ul>
            
            <div class="alert">
              <h3>⚠️ Security Notice</h3>
              <p>If you did not make this password change, please:</p>
              <ul>
                <li>Contact the system administrator immediately</li>
                <li>Check your account for any unauthorized activity</li>
                <li>Consider changing your password again if you suspect unauthorized access</li>
              </ul>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>You can now log in with your new password</li>
              <li>Make sure to use a strong, unique password</li>
              <li>Consider enabling two-factor authentication if available</li>
            </ul>
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
