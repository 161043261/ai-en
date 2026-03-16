import { WordQuery } from '@ai-en/common/types/word';
import { PrismaService, ResponseService } from '@libs/shared';
import { WordBookWhereInput } from '@libs/shared/generated/prisma/models';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WordBookService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly responseService: ResponseService,
  ) {}

  async findAll(query: WordQuery) {
    const { page = 1, pageSize = 12, word, ...rest } = query;
    const where: WordBookWhereInput = {
      word: word ? { contains: word } : undefined,
      ...rest,
    };
    const [total, list] = await Promise.all([
      this.prismaService.wordBook.count({ where }),
      this.prismaService.wordBook.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: {
          frq: 'desc',
        },
      }),
    ]);
    return this.responseService.success({
      total,
      list,
    });
  }
}
