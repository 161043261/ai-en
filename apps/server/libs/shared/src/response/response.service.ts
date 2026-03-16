import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  success(data: unknown) {
    return {
      data,
      message: 'ok',
      code: 200,
    };
  }
  error(data: unknown = null, message: string, code: number = 500) {
    return {
      data,
      message: message || 'error',
      code,
    };
  }
}
