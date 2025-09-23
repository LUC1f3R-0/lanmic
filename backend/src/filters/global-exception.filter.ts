import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
      }
    } else {
      // Handle unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';

      // Log unexpected errors
      this.logger.error(
        `Unexpected error: ${exception}`,
        (exception as Error).stack,
      );
    }

    // Log the error (but reduce noise for expected 401 errors)
    if (status === 401) {
      // Log 401 errors as warnings instead of errors since they're expected after logout
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${typeof message === 'string' ? message : JSON.stringify(message)}`,
      );
    } else {
      // Log other errors normally
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${typeof message === 'string' ? message : JSON.stringify(message)}`,
        (exception as Error).stack,
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message)
        ? message
        : [typeof message === 'string' ? message : JSON.stringify(message)],
      error,
    };

    response.status(status).json(errorResponse);
  }
}
