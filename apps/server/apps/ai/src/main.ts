import { NestFactory } from '@nestjs/core';
import { AiModule } from './ai.module';
import { GlobalInterceptor, GlobalExceptionFilter } from '@libs/shared';
import { config } from '@ai-en/common/config';

async function bootstrap() {
  const app = await NestFactory.create(AiModule);
  app.useGlobalInterceptors(new GlobalInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(config.ports.ai);
}
bootstrap().catch(() => {
  process.exit(1);
});
