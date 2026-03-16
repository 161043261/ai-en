import { Module } from '@nestjs/common';
import { WordBookService } from './word-book.service';
import { WordBookController } from './word-book.controller';

@Module({
  controllers: [WordBookController],
  providers: [WordBookService],
})
export class WordBookModule {}
