import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { EmailService } from '../auth/email.service';

@Module({
  controllers: [ContactController],
  providers: [ContactService, EmailService],
  exports: [ContactService],
})
export class ContactModule {}
