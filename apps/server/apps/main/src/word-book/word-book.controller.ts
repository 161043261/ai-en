import { Controller, Get, Query } from '@nestjs/common';
import type { WordQuery } from '@ai-en/common/types/word';
import { WordQueryPipe } from './word-book.pipe';
import { WordBookService } from './word-book.service';

@Controller('word-book')
export class WordBookController {
  constructor(private readonly wordBookService: WordBookService) {}

  @Get()
  async findAll(@Query(WordQueryPipe) query: WordQuery) {
    return this.wordBookService.findAll(query);
  }
}
