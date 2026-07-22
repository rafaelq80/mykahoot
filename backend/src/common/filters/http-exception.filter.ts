import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const body =
        typeof exceptionResponse === 'string'
          ? { statusCode: status, message: exceptionResponse, path: request.url, timestamp: new Date().toISOString() }
          : { ...(exceptionResponse as object), path: request.url, timestamp: new Date().toISOString() };

      if (status >= 500) {
        this.logger.error(
          `${request.method} ${request.url} → ${status}`,
          exception.stack,
        );
      }

      response.status(status).json(body);
      return;
    }

    // Unhandled / unknown error → 500 without leaking internals
    const stack = exception instanceof Error ? exception.stack : String(exception);
    this.logger.error(
      `${request.method} ${request.url} → 500 (unhandled)`,
      stack,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
