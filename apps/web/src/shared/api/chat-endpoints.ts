import type { ApiClient } from "../http";
import {
  ChatMessageListSchema,
  ChatModeListSchema,
  ChatRoleTypeSchema,
  type ChatMessageList,
  type ChatModeList,
  type ChatRoleType,
} from "./chat-schema";
import { createQueryParams } from "./query-params";
import { createResponseSchema } from "./response-schema";

export type ChatEndpoints = {
  readonly getChatHistory: (
    userId: string,
    role: ChatRoleType,
  ) => Promise<ChatMessageList>;
  readonly getChatMode: () => Promise<ChatModeList>;
};

export function createChatEndpoints(client: ApiClient): ChatEndpoints {
  return {
    getChatHistory: async (userId, role) => {
      const response = await client.get(
        "/ai/chat/history",
        createResponseSchema(ChatMessageListSchema),
        {
          params: createQueryParams({
            role: ChatRoleTypeSchema.parse(role),
            userId,
          }),
        },
      );
      return response.data;
    },
    getChatMode: async () => {
      const response = await client.get(
        "/ai/prompt/list",
        createResponseSchema(ChatModeListSchema),
      );
      return response.data;
    },
  };
}
