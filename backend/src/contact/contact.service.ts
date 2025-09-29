import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly emailService: EmailService) {}

  async sendContactEmail(contactData: ContactFormData): Promise<void> {
    try {
      // Send email to company
      await this.sendCompanyNotification(contactData);
      
      // Send confirmation email to sender
      await this.sendSenderConfirmation(contactData);
      
      this.logger.log(`Contact form submitted successfully from ${contactData.email}`);
    } catch (error) {
      this.logger.error('Failed to send contact emails:', error);
      throw error;
    }
  }

  private async sendCompanyNotification(contactData: ContactFormData): Promise<void> {
    if (!this.emailService.isEmailServiceReady()) {
      this.logger.warn('Email service not ready, logging contact form to console');
      this.logContactToConsole(contactData, 'COMPANY NOTIFICATION');
      return;
    }

    try {
      const companyEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
      if (!companyEmail) {
        throw new Error('Company email not configured');
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Contact Form'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: companyEmail,
        subject: `New Contact Form Submission from ${contactData.name}`,
        html: this.getCompanyNotificationTemplate(contactData),
        text: this.getCompanyNotificationText(contactData),
      };

      await this.emailService.sendEmail(mailOptions);
      this.logger.log(`Company notification sent successfully for contact from ${contactData.email}`);
    } catch (error) {
      this.logger.error('Failed to send company notification:', error);
      this.logContactToConsole(contactData, 'COMPANY NOTIFICATION (FAILED)');
      throw error;
    }
  }

  private async sendSenderConfirmation(contactData: ContactFormData): Promise<void> {
    if (!this.emailService.isEmailServiceReady()) {
      this.logger.warn('Email service not ready, logging confirmation to console');
      this.logContactToConsole(contactData, 'SENDER CONFIRMATION');
      return;
    }

    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'LANMIC Polymers'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: contactData.email,
        subject: 'Thank you for contacting LANMIC Polymers',
        html: this.getSenderConfirmationTemplate(contactData),
        text: this.getSenderConfirmationText(contactData),
      };

      await this.emailService.sendEmail(mailOptions);
      this.logger.log(`Sender confirmation sent successfully to ${contactData.email}`);
    } catch (error) {
      this.logger.error('Failed to send sender confirmation:', error);
      this.logContactToConsole(contactData, 'SENDER CONFIRMATION (FAILED)');
      // Don't throw error for confirmation email, just log it
    }
  }

  private logContactToConsole(contactData: ContactFormData, type: string): void {
    console.log(`\n=== ${type} (SMTP NOT CONFIGURED) ===`);
    console.log(`From: ${contactData.name} <${contactData.email}>`);
    console.log(`Phone: ${contactData.phone || 'Not provided'}`);
    console.log(`Company: ${contactData.company || 'Not provided'}`);
    console.log(`Message: ${contactData.message}`);
    console.log(`Submitted at: ${new Date().toLocaleString()}`);
    console.log(`Note: SMTP not configured - email not sent`);
    console.log(`==========================================\n`);
  }

  private getCompanyNotificationTemplate(contactData: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .contact-info { background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .message-box { background: #e8f4fd; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p>LANMIC Polymers Website</p>
          </div>
          <div class="content">
            <h2>Contact Details</h2>
            <div class="contact-info">
              <div class="value">
                <span class="label">Name:</span> ${contactData.name}
              </div>
              <div class="value">
                <span class="label">Email:</span> <a href="mailto:${contactData.email}">${contactData.email}</a>
              </div>
              ${contactData.phone ? `
              <div class="value">
                <span class="label">Phone:</span> <a href="tel:${contactData.phone}">${contactData.phone}</a>
              </div>
              ` : ''}
              ${contactData.company ? `
              <div class="value">
                <span class="label">Company:</span> ${contactData.company}
              </div>
              ` : ''}
              <div class="value">
                <span class="label">Submitted:</span> ${new Date().toLocaleString()}
              </div>
            </div>
            
            <h3>Message</h3>
            <div class="message-box">
              <p style="margin: 0; white-space: pre-wrap;">${contactData.message}</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Reply to the customer at <a href="mailto:${contactData.email}">${contactData.email}</a></li>
              <li>Follow up within 24 hours for best customer experience</li>
              <li>Add to CRM system if applicable</li>
            </ul>
          </div>
          <div class="footer">
            <p>This is an automated notification from the LANMIC Polymers contact form.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getCompanyNotificationText(contactData: ContactFormData): string {
    return `
New Contact Form Submission - LANMIC Polymers

Contact Details:
- Name: ${contactData.name}
- Email: ${contactData.email}
- Phone: ${contactData.phone || 'Not provided'}
- Company: ${contactData.company || 'Not provided'}
- Submitted: ${new Date().toLocaleString()}

Message:
${contactData.message}

Please reply to the customer at ${contactData.email} within 24 hours for best customer experience.

This is an automated notification from the LANMIC Polymers contact form.
    `.trim();
  }

  private getSenderConfirmationTemplate(contactData: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting LANMIC Polymers</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; margin: 20px 0; text-align: center; }
          .info-box { background: #e8f5e8; border: 1px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .contact-details { background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Thank You for Contacting Us!</h1>
            <p>LANMIC Polymers</p>
          </div>
          <div class="content">
            <div class="success-icon">🎉</div>
            
            <h2>Hello ${contactData.name}!</h2>
            <p>Thank you for reaching out to LANMIC Polymers. We have received your message and will get back to you within 24 hours.</p>
            
            <div class="info-box">
              <h3>📋 Your Message Summary</h3>
              <p><strong>Subject:</strong> Contact Form Submission</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Reference:</strong> ${contactData.email}</p>
            </div>
            
            <h3>What happens next?</h3>
            <ul>
              <li>Our team will review your message within 24 hours</li>
              <li>We'll respond to your inquiry with detailed information</li>
              <li>If you have urgent requirements, please call us directly</li>
            </ul>
            
            <div class="contact-details">
              <h3>📞 Need Immediate Assistance?</h3>
              <p>For urgent inquiries, you can reach us at:</p>
              <ul>
                <li><strong>Phone:</strong> +91-XXX-XXXX-XXXX</li>
                <li><strong>Email:</strong> info@lanmicpolymers.com</li>
                <li><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</li>
              </ul>
            </div>
            
            <p>We appreciate your interest in LANMIC Polymers and look forward to serving you!</p>
            
            <p>Best regards,<br>
            <strong>The LANMIC Polymers Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation from LANMIC Polymers. Please do not reply to this email.</p>
            <p>If you need to contact us, please use the information provided above.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getSenderConfirmationText(contactData: ContactFormData): string {
    return `
Thank You for Contacting LANMIC Polymers!

Hello ${contactData.name}!

Thank you for reaching out to LANMIC Polymers. We have received your message and will get back to you within 24 hours.

Your Message Summary:
- Subject: Contact Form Submission
- Submitted: ${new Date().toLocaleString()}
- Reference: ${contactData.email}

What happens next?
- Our team will review your message within 24 hours
- We'll respond to your inquiry with detailed information
- If you have urgent requirements, please call us directly

Need Immediate Assistance?
For urgent inquiries, you can reach us at:
- Phone: +91-XXX-XXXX-XXXX
- Email: info@lanmicpolymers.com
- Business Hours: Monday - Friday, 9:00 AM - 6:00 PM

We appreciate your interest in LANMIC Polymers and look forward to serving you!

Best regards,
The LANMIC Polymers Team

---
This is an automated confirmation from LANMIC Polymers. Please do not reply to this email.
If you need to contact us, please use the information provided above.
    `.trim();
  }
}
