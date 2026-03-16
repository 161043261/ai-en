import { WordQuery } from '@ai-en/common/types/word';
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class WordQueryPipe implements PipeTransform<any, WordQuery> {
  transform(
    value: {
      [key in keyof WordQuery]: string | undefined;
    },
    // metadata: ArgumentMetadata,
  ): WordQuery {
    return {
      page: value.page ? Number.parseInt(value.page) : 1,
      pageSize: value.pageSize ? Number.parseInt(value.pageSize) : 10,
      word: value.word,
      gk: this.parseBoolean(value.gk),
      zk: this.parseBoolean(value.zk),
      gre: this.parseBoolean(value.gre),
      toefl: this.parseBoolean(value.toefl),
      ielts: this.parseBoolean(value.ielts),
      cet6: this.parseBoolean(value.cet6),
      cet4: this.parseBoolean(value.cet4),
      ky: this.parseBoolean(value.ky),
    };
  }

  private parseBoolean(value: any): boolean | undefined {
    if (value === true || value === 'true') {
      return true;
    }
    if (value === false || value === 'false') {
      return false;
    }
    return undefined;
  }
}
