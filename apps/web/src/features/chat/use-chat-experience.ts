import { useEffect, useState } from "react";
import { useAuthSession } from "../auth";
import { useAppServices } from "../../app/use-app-services";
import type {
  ChatMessageList as ChatMessages,
  ChatMode,
  ChatRoleType,
} from "../../shared/api/chat-schema";
import type { ChatComposerPayload } from "./chat-composer";
import {
  appendChatStreamChunk,
  createHumanMessage,
  createPendingAssistantMessage,
} from "./chat-message-state";

export function useChatExperience() {
  const { api, chatStream, session } = useAppServices();
  const [activeRole, setActiveRole] = useState<ChatRoleType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastPayload, setLastPayload] = useState<ChatComposerPayload | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessages>([]);
  const [modes, setModes] = useState<readonly ChatMode[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);
  const { user } = useAuthSession(session);

  useEffect(() => {
    let isActive = true;
    void api.chat
      .getChatMode()
      .then((nextModes) => {
        if (!isActive) return;
        setModes(nextModes);
        setActiveRole(nextModes[0]?.role ?? null);
      })
      .catch(() => {
        if (isActive) setError("Unable to load conversation roles.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [api.chat]);

  useEffect(() => {
    if (!user || !activeRole) return;
    let isActive = true;
    setIsLoading(true);
    void api.chat
      .getChatHistory(user.id, activeRole)
      .then((history) => {
        if (isActive) setMessages(history);
      })
      .catch(() => {
        if (isActive) setError("Unable to load chat history.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [activeRole, api.chat, user]);

  const sendMessage = (payload: ChatComposerPayload, replay = false) => {
    if (!activeRole || !user) return;
    setStreamError(null);
    setLastPayload(payload);
    if (!replay) {
      setMessages((current) => [
        ...current,
        createHumanMessage(payload.content),
        createPendingAssistantMessage(),
      ]);
    }
    setIsStreaming(true);
    void chatStream
      .send(
        {
          content: payload.content,
          deepThink: payload.deepThink,
          role: activeRole,
          userId: user.id,
          webSearch: payload.webSearch,
        },
        {
          onChunk: (chunk) => {
            setMessages((current) => appendChatStreamChunk(current, chunk));
          },
          onError: () => {
            setStreamError("The realtime response stopped before completion.");
          },
        },
      )
      .catch(() => {
        setStreamError("The realtime response stopped before completion.");
      })
      .finally(() => {
        setIsStreaming(false);
      });
  };

  return {
    activeRole,
    error,
    isAuthOpen,
    isLoading,
    isStreaming,
    lastPayload,
    messages,
    modes,
    sendMessage,
    setActiveRole,
    setIsAuthOpen,
    streamError,
    user,
  };
}
