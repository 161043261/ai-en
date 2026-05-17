import type {
  ChatMessage,
  ChatMessageList,
} from "../../shared/api/chat-schema";

export function createHumanMessage(content: string): ChatMessage {
  return { content, role: "human", type: "chat" };
}

export function createPendingAssistantMessage(): ChatMessage {
  return { content: "", reasoning: "", role: "ai", type: "chat" };
}

export function appendChatStreamChunk(
  messages: ChatMessageList,
  chunk: ChatMessage,
): ChatMessageList {
  const lastMessage = messages.at(-1);

  if (!lastMessage || lastMessage.role !== "ai") {
    return [...messages, chunk];
  }

  const nextMessage: ChatMessage = {
    ...lastMessage,
    content:
      chunk.type === "chat"
        ? `${lastMessage.content}${chunk.content}`
        : lastMessage.content,
    reasoning:
      chunk.type === "reasoning"
        ? `${lastMessage.reasoning ?? ""}${chunk.content}`
        : lastMessage.reasoning,
  };

  return [...messages.slice(0, -1), nextMessage];
}
