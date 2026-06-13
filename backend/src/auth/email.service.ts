import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type SendMailOptions, type Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private ready = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('smtp.host'),
      port: this.configService.getOrThrow<number>('smtp.port'),
      secure: this.configService.getOrThrow<boolean>('smtp.secure'),
      auth: {
        user: this.configService.getOrThrow<string>('smtp.user'),
        pass: this.configService.getOrThrow<string>('smtp.password'),
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    try {
      await this.transporter.verify();
      this.ready = true;
      this.logger.log('SMTP connection verified');
    } catch (error) {
      this.ready = false;
      this.logger.error('SMTP verification failed');
      if (this.configService.getOrThrow<boolean>('smtp.required')) {
        throw error;
      }
    }
  }

  isEmailServiceReady(): boolean {
    return this.ready;
  }

  async sendEmail(options: SendMailOptions): Promise<void> {
    if (!this.transporter || !this.ready) {
      throw new ServiceUnavailableException('Email service is unavailable');
    }

    await this.transporter.sendMail(options);
  }

  async sendOtpEmail(
    recipient: string,
    otp: string,
    purpose:
      | 'registration'
      | 'password reset'
      | 'email verification'
      | 'email change',
  ): Promise<void> {
    const fromName = this.configService.getOrThrow<string>('smtp.fromName');
    const fromEmail = this.configService.getOrThrow<string>('smtp.fromEmail');
    const safePurpose = this.escapeHtml(purpose);

    await this.sendEmail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipient,
      subject: `Your LANMIC ${purpose} code`,
      text: `Your one-time code is ${otp}. It expires in 10 minutes. Do not share this code.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
          <h2>LANMIC ${safePurpose}</h2>
          <p>Your one-time verification code is:</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:8px">${otp}</p>
          <p>This code expires in 10 minutes and can be used only for this ${safePurpose} request.</p>
          <p>If you did not make this request, ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetSuccessEmail(recipient: string): Promise<void> {
    const fromName = this.configService.getOrThrow<string>('smtp.fromName');
    const fromEmail = this.configService.getOrThrow<string>('smtp.fromEmail');

    await this.sendEmail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipient,
      subject: 'Your LANMIC password was changed',
      text: 'Your LANMIC password was changed. If this was not you, contact the site administrator immediately.',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
          <h2>Password changed</h2>
          <p>Your LANMIC password was changed successfully.</p>
          <p>If this was not you, contact the site administrator immediately.</p>
        </div>
      `,
    });
  }

  async sendEmailChangeSuccessEmail(
    previousEmail: string,
    newEmail: string,
  ): Promise<void> {
    const fromName = this.configService.getOrThrow<string>('smtp.fromName');
    const fromEmail = this.configService.getOrThrow<string>('smtp.fromEmail');
    const subject = 'Your LANMIC email address was changed';
    const text = `The LANMIC account email was changed from ${previousEmail} to ${newEmail}. If this was not you, contact the site administrator immediately.`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2>Email address changed</h2>
        <p>The LANMIC account email was changed from <strong>${this.escapeHtml(previousEmail)}</strong> to <strong>${this.escapeHtml(newEmail)}</strong>.</p>
        <p>If this was not you, contact the site administrator immediately.</p>
      </div>
    `;

    await Promise.all([
      this.sendEmail({
        from: `"${fromName}" <${fromEmail}>`,
        to: previousEmail,
        subject,
        text,
        html,
      }),
      this.sendEmail({
        from: `"${fromName}" <${fromEmail}>`,
        to: newEmail,
        subject,
        text,
        html,
      }),
    ]);
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };
      return map[character];
    });
  }
}
