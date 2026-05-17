import { describe, expect, test } from "vitest";
import { appendChatStreamChunk, createPendingAssistantMessage } from ".";
import type { ChatMessageList } from "../../shared/api/chat-schema";

describe("chat message state", () => {
  test("appends reasoning and chat chunks to the pending assistant message", () => {
    const messages: ChatMessageList = [createPendingAssistantMessage()];
    const withReasoning = appendChatStreamChunk(messages, {
      content: "Thinking...",
      role: "ai",
      type: "reasoning",
    });
    const withChat = appendChatStreamChunk(withReasoning, {
      content: "Hello",
      role: "ai",
      type: "chat",
    });

    expect(withChat).toEqual([
      {
        content: "Hello",
        reasoning: "Thinking...",
        role: "ai",
        type: "chat",
      },
    ]);
  });
});
