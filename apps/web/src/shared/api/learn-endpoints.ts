import type { ApiClient } from "../http";
import {
  ResultLearnSchema,
  SaveWordMasterSchema,
  type ResultLearn,
} from "./learn-schema";
import { createResponseSchema } from "./response-schema";
import { WordSchema, type Word } from "./word-schema";

export type LearnEndpoints = {
  readonly getWordList: (courseId: string) => Promise<readonly Word[]>;
  readonly saveWordMaster: (wordIds: readonly string[]) => Promise<ResultLearn>;
};

export function createLearnEndpoints(client: ApiClient): LearnEndpoints {
  return {
    getWordList: async (courseId) => {
      const response = await client.get(
        `/learn/word/${encodeURIComponent(courseId)}`,
        createResponseSchema(WordSchema.array()),
      );
      return response.data;
    },
    saveWordMaster: async (wordIds) => {
      const body = SaveWordMasterSchema.parse({ wordIds });
      const response = await client.post(
        "/learn/word/master",
        createResponseSchema(ResultLearnSchema),
        { body },
      );
      return response.data;
    },
  };
}
