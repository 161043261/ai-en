import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();
    response.status(exception.getStatus()).json({
      message: exception.message,
      code: exception.getStatus(),
      ok: false,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
