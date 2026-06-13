import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  requestId: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const requestId = this.safeRequestId(request.header('x-request-id'));

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = this.toResponseBody(exception, status, request, requestId);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${this.redactPath(request.originalUrl)} -> ${status} [${requestId}]`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${this.redactPath(request.originalUrl)} -> ${status} [${requestId}]`,
      );
    }

    response.setHeader('x-request-id', requestId);
    response.status(status).json(payload);
  }

  private toResponseBody(
    exception: unknown,
    status: number,
    request: Request,
    requestId: string,
  ): ErrorBody {
    let message: string | string[] = 'Internal server error';
    let error = HttpStatus[status] ?? 'Error';
    let details: unknown;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        const body = response as Record<string, unknown>;
        if (typeof body.error === 'string') error = body.error;
        if (typeof body.message === 'string' || Array.isArray(body.message)) {
          message = body.message as string | string[];
        }
        if ('details' in body) details = body.details;
      }
    }

    return {
      statusCode: status,
      error,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      path: this.redactPath(request.originalUrl),
      ...(details === undefined ? {} : { details }),
    };
  }

  private safeRequestId(value: string | undefined): string {
    if (value && /^[a-zA-Z0-9_-]{8,100}$/.test(value)) return value;
    return randomUUID();
  }

  private redactPath(path: string): string {
    return path
      .replace(/(verify-email\/)[^/?#]+/gi, '$1[redacted]')
      .replace(/([?&](?:token|otp|code|grant)=)[^&#]+/gi, '$1[redacted]');
  }
}
