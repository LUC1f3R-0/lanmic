import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SimpleBlogModule } from './blog/simple-blog.module';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { ContactModule } from './contact/contact.module';
import { DatabaseModule } from './database.module';
import { ExecutiveModule } from './executive/executive.module';
import { CsrfGuard } from './guards/csrf.guard';
import { HealthModule } from './health/health.module';
import { SecurityModule } from './security/security.module';
import { AppThrottlerGuard } from './security/app-throttler.guard';
import { TeamModule } from './team/team.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { UploadModule } from './upload/upload.module';
import { SimpleWebSocketModule } from './websocket/simple-websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: false,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),

    ScheduleModule.forRoot(),

    DatabaseModule,
    SecurityModule,

    // Uses NestJS's built-in in-memory throttling storage.
    // The counters reset whenever this Node.js process restarts.
    ThrottlerModule.forRoot([
      {
        name: 'burst',
        ttl: 1_000,
        limit: 15,
      },
      {
        name: 'short',
        ttl: 60_000,
        limit: 120,
      },
      {
        name: 'medium',
        ttl: 600_000,
        limit: 500,
      },
      {
        name: 'long',
        ttl: 3_600_000,
        limit: 3_000,
      },
    ]),

    AuthModule,
    SimpleWebSocketModule,
    SimpleBlogModule,
    TeamModule,
    ExecutiveModule,
    TestimonialsModule,
    UploadModule,
    ContactModule,
    HealthModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },

    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
