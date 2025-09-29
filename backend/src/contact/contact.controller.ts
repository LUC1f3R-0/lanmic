import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ContactService, ContactFormData } from './contact.service';
import { ContactFormDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async submitContactForm(@Body() contactFormDto: ContactFormDto): Promise<{ message: string; success: boolean }> {
    try {
      this.logger.log(`Contact form submission received from ${contactFormDto.email}`);
      
      const contactData: ContactFormData = {
        name: contactFormDto.name,
        email: contactFormDto.email,
        phone: contactFormDto.phone,
        company: contactFormDto.company,
        message: contactFormDto.message,
      };

      await this.contactService.sendContactEmail(contactData);
      
      this.logger.log(`Contact form processed successfully for ${contactFormDto.email}`);
      
      return {
        message: 'Thank you for your message! We will get back to you within 24 hours.',
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to process contact form from ${contactFormDto.email}:`, error);
      
      return {
        message: 'We apologize, but there was an error processing your message. Please try again or contact us directly.',
        success: false,
      };
    }
  }
}
