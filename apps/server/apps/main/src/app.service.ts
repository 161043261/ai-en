import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}
  getHello(): string {
    return 'Hello';
  }
}
