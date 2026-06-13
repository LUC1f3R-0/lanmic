import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../auth/email.service';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

@Injectable()
export class ContactService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendContactEmail(input: ContactFormData): Promise<void> {
    const contact = this.normalize(input);
    const fromName = this.configService.getOrThrow<string>('smtp.fromName');
    const fromEmail = this.configService.getOrThrow<string>('smtp.fromEmail');
    const recipient = this.configService.getOrThrow<string>(
      'smtp.contactRecipient',
    );

    await Promise.all([
      this.emailService.sendEmail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipient,
        replyTo: contact.email,
        subject: 'New LANMIC website contact request',
        text: this.companyText(contact),
        html: this.companyHtml(contact),
      }),
      this.emailService.sendEmail({
        from: `"${fromName}" <${fromEmail}>`,
        to: contact.email,
        subject: 'We received your LANMIC enquiry',
        text: `Hello ${contact.name},\n\nWe received your message and will respond as soon as possible.\n\nLANMIC Polymers`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px"><h2>Thank you for contacting LANMIC</h2><p>Hello ${this.escapeHtml(contact.name)},</p><p>We received your message and will respond as soon as possible.</p><p>LANMIC Polymers</p></div>`,
      }),
    ]);
  }

  private normalize(input: ContactFormData): ContactFormData {
    return {
      name: this.cleanHeader(input.name),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim(),
      company: input.company?.trim(),
      message: input.message.trim(),
    };
  }

  private cleanHeader(value: string): string {
    return value.replace(/[\r\n]+/g, ' ').trim();
  }

  private companyText(contact: ContactFormData): string {
    return [
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone ?? 'Not provided'}`,
      `Company: ${contact.company ?? 'Not provided'}`,
      '',
      'Message:',
      contact.message,
    ].join('\n');
  }

  private companyHtml(contact: ContactFormData): string {
    const row = (label: string, value: string) =>
      `<tr><th style="text-align:left;padding:8px;border:1px solid #ddd">${label}</th><td style="padding:8px;border:1px solid #ddd">${this.escapeHtml(value)}</td></tr>`;

    return `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;padding:24px"><h2>New website enquiry</h2><table style="border-collapse:collapse;width:100%">${row('Name', contact.name)}${row('Email', contact.email)}${row('Phone', contact.phone ?? 'Not provided')}${row('Company', contact.company ?? 'Not provided')}</table><h3>Message</h3><p style="white-space:pre-wrap">${this.escapeHtml(contact.message)}</p></div>`;
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };
      return entities[character];
    });
  }
}
