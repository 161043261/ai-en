import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';

const transformBigInt = (obj: unknown): unknown => {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(transformBigInt);
  }
  if (typeof obj === 'object' && obj !== null) {
    if (obj instanceof Date) {
      return obj;
    }
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, transformBigInt(value)]),
    );
  }
  return obj;
};

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<{
      data: unknown;
      message: string;
      code: number;
    }>,
  ): Observable<{
    data: unknown;
    message: string;
    code: number;
    ok: boolean;
    timestamp: string;
    path: string;
  }> {
    const ctx = context.switchToHttp();
    const request: Request = ctx.getRequest();
    return next.handle().pipe(
      map((val) => {
        return {
          data: transformBigInt(val?.data),
          message: val?.message ?? 'ok',
          code: val?.code ?? 200,
          ok: true,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
