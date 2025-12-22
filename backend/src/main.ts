import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DatabaseService } from './database.service';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { CsrfInterceptor } from './interceptors/csrf.interceptor';

dotenv.config({ path: __dirname + '/../.env' });

const PORT = process.env.PORT || 3002;
const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Test database connection
  const databaseService = app.get(DatabaseService);
  try {
    const isConnected = await databaseService.testConnection();
    if (isConnected) {
      logger.log('✅ Database connection successful');
    } else {
      logger.error('❌ Database connection failed');
      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ Database connection error:', error.message);
    process.exit(1);
  }

  // Enable cookie parser
  app.use(cookieParser());

  // Helmet for security headers (must be before other middleware)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for AOS and Tailwind
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false, // Allow external resources if needed
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow CORS resources
    }),
  );

  // Additional security headers
  app.use((req, res, next) => {
    // Strict Transport Security (HSTS) - only in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
    }
    
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()',
    );
    
    // Prevent caching of sensitive data
    if (req.path.startsWith('/auth') || req.path.startsWith('/dashboard')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  });

  // Serve static files from uploads directory (includes all subdirectories)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Global CSRF interceptor to set CSRF token cookie
  app.useGlobalInterceptors(new CsrfInterceptor());

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints,
        }));
        return new HttpException(
          {
            message: 'Validation failed',
            errors: result,
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS with secure settings
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.) in development
      if (!origin && process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      // Validate origin
      if (origin === frontendUrl || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-CSRF-Token', // CSRF token header
    ],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours
  });

  const config = new DocumentBuilder()
    .setTitle('Lanmic API')
    .setDescription(
      'API documentation for Lanmic application with authentication system',
    )
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('lanmic', 'General application endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT);
  console.log(`Application is running on: http://localhost:${PORT}`);
  console.log(
    `Swagger documentation available at: http://localhost:${PORT}/api`,
  );
}
bootstrap();
