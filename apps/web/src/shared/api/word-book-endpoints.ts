import type { ApiClient } from "../http";
import { createQueryParams } from "./query-params";
import { createResponseSchema } from "./response-schema";
import {
  WordListSchema,
  WordQuerySchema,
  type WordList,
  type WordQuery,
} from "./word-schema";

export type WordBookEndpoints = {
  readonly getWordBookList: (params: WordQuery) => Promise<WordList>;
};

export function createWordBookEndpoints(client: ApiClient): WordBookEndpoints {
  return {
    getWordBookList: async (params) => {
      const query = WordQuerySchema.parse(params);
      const response = await client.get("/word-book", createResponseSchema(WordListSchema), {
        params: createQueryParams(query),
      });
      return response.data;
    },
  };
}
