import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { resolve } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });

  const logger = new Logger('Bootstrap');

  app.useLogger(logger);

  const configService = app.get(ConfigService);

  const nodeEnv = configService.getOrThrow<string>('app.nodeEnv');

  const isProduction = nodeEnv === 'production';

  const port = configService.getOrThrow<number>('app.port');

  const frontendUrl = configService.getOrThrow<string>('app.frontendUrl');

  const trustProxyHops = configService.getOrThrow<number>('app.trustProxyHops');

  const expressInstance = app.getHttpAdapter().getInstance();

  if (trustProxyHops > 0) {
    expressInstance.set('trust proxy', trustProxyHops);
  }

  expressInstance.disable('x-powered-by');

  app.use(
    express.json({
      limit: '1mb',
      strict: true,
    }),
  );

  app.use(
    express.urlencoded({
      extended: false,
      limit: '64kb',
      parameterLimit: 50,
    }),
  );

  app.use(cookieParser());

  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'none'"],
              frameAncestors: ["'none'"],
              baseUri: ["'none'"],
              formAction: ["'none'"],
            },
          }
        : false,

      crossOriginEmbedderPolicy: false,

      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },

      hsts: isProduction
        ? {
            maxAge: 31_536_000,
            includeSubDomains: true,
            preload: true,
          }
        : false,

      referrerPolicy: {
        policy: 'no-referrer',
      },
    }),
  );

  app.use((request: Request, response: Response, next: NextFunction) => {
    response.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    );

    response.setHeader('X-Content-Type-Options', 'nosniff');

    if (request.path.startsWith('/auth')) {
      response.setHeader('Cache-Control', 'no-store, private');

      response.setHeader('Pragma', 'no-cache');
    }

    next();
  });

  app.enableCors({
    origin(origin, callback) {
      if (origin === undefined || origin === frontendUrl) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed'));
    },

    credentials: true,

    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-CSRF-Token',
      'X-Request-Id',
      'Idempotency-Key',
    ],

    exposedHeaders: [
      'X-Request-Id',
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset',
    ],

    maxAge: 86_400,
  });

  const uploadDirectory = resolve(
    process.cwd(),
    configService.getOrThrow<string>('upload.directory'),
  );

  app.useStaticAssets(uploadDirectory, {
    prefix: '/uploads/',
    fallthrough: false,
    dotfiles: 'deny',
    index: false,
    maxAge: isProduction ? '7d' : 0,
    immutable: isProduction,

    setHeaders(response: Response) {
      response.setHeader('X-Content-Type-Options', 'nosniff');

      response.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; sandbox",
      );

      response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,

      transformOptions: {
        enableImplicitConversion: false,
      },

      stopAtFirstError: false,

      exceptionFactory: (errors) => {
        return new BadRequestException({
          message: 'Validation failed',

          details: errors.map((error) => ({
            field: error.property,
            constraints: error.constraints ?? {},
          })),
        });
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableShutdownHooks();

  const swaggerEnabled =
    configService.getOrThrow<boolean>('app.swaggerEnabled');

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('LANMIC API')
      .setDescription('LANMIC administrative and public API')
      .setVersion('1.0.0')
      .addCookieAuth('access_token')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: false,
      },
    });
  }

  await app.listen(port, '0.0.0.0');

  logger.log(`LANMIC API listening on port ${port} (${nodeEnv})`);
}

void bootstrap();
