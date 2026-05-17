import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ChatDtoSchema, ChatMessageSchema } from "../api/chat-schema";
import type { ChatDto, ChatMessage } from "../api/chat-schema";

export type ChatStream = {
  readonly send: (
    payload: ChatDto,
    callbacks: ChatStreamCallbacks,
  ) => Promise<void>;
};

export type ChatStreamCallbacks = {
  readonly onChunk: (message: ChatMessage) => void;
  readonly onError?: (error: Error) => void;
};

export type ChatStreamOptions = {
  readonly baseUrl: string;
};

function parseEventData(data: string): ChatMessage {
  const parsed: unknown = JSON.parse(data);
  return ChatMessageSchema.parse(parsed);
}

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error("Chat stream failed.");
}

export function createChatStream(options: ChatStreamOptions): ChatStream {
  return {
    send: async (payload, callbacks) => {
      const body = ChatDtoSchema.parse(payload);
      await fetchEventSource(`${options.baseUrl}/chat`, {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        onopen: async (response) => {
          if (!response.ok) {
            throw new Error(
              `Chat stream failed with status ${response.status}.`,
            );
          }
        },
        onerror: (error: unknown) => {
          const streamError = normalizeError(error);
          callbacks.onError?.(streamError);
          throw streamError;
        },
        onmessage: (event) => {
          try {
            callbacks.onChunk(parseEventData(event.data));
          } catch (error) {
            const streamError = normalizeError(error);
            callbacks.onError?.(streamError);
            throw streamError;
          }
        },
      });
    },
  };
}
