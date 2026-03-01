import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SharedModule } from '@libs/shared';

@Module({
  imports: [UserModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
