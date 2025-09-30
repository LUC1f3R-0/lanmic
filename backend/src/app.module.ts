import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { AuthModule } from './auth/auth.module';
import { SimpleBlogModule } from './blog/simple-blog.module';
import { TeamModule } from './team/team.module';
import { ExecutiveModule } from './executive/executive.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { UploadModule } from './upload/upload.module';
import { SimpleWebSocketModule } from './websocket/simple-websocket.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [AuthModule, SimpleBlogModule, TeamModule, ExecutiveModule, TestimonialsModule, UploadModule, SimpleWebSocketModule, ContactModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
