import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { ContactFormDto } from './dto/contact.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({
    burst: { limit: 2, ttl: 10_000 },
    short: { limit: 5, ttl: 60_000 },
    long: { limit: 20, ttl: 3_600_000 },
  })
  @ApiOperation({ summary: 'Submit a public contact enquiry' })
  @ApiResponse({ status: 202, description: 'Enquiry accepted' })
  async submitContactForm(@Body() dto: ContactFormDto) {
    await this.contactService.sendContactEmail(dto);
    return {
      success: true,
      message: 'Thank you. Your message has been received.',
    };
  }
}
