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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
      {
        name: 'medium',
        ttl: 600000, // 10 minutes
        limit: 100, // 100 requests per 10 minutes
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
    ]),
    AuthModule,
    SimpleBlogModule,
    TeamModule,
    ExecutiveModule,
    TestimonialsModule,
    UploadModule,
    SimpleWebSocketModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseService,
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
