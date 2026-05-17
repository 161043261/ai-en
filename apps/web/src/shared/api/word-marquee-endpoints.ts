import type { ApiClient } from "../http";
import { createResponseSchema } from "./response-schema";
import {
  WordMarqueeListSchema,
  type WordMarqueeList,
} from "./word-marquee-schema";

export type WordMarqueeEndpoints = {
  readonly getWords: () => Promise<WordMarqueeList>;
};

export function createWordMarqueeEndpoints(
  client: ApiClient,
): WordMarqueeEndpoints {
  return {
    getWords: async () => {
      const response = await client.get(
        "/word-marquee",
        createResponseSchema(WordMarqueeListSchema),
      );
      return response.data;
    },
  };
}
