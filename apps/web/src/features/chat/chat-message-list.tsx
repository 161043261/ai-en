import type { ChatMessageList as ChatMessages } from "../../shared/api/chat-schema";
import { EmptyState } from "../../shared/ui";
import { MarkdownMessage } from "./markdown-message";

export type ChatMessageListProps = {
  readonly messages: ChatMessages;
};

export function ChatMessageList({ messages }: ChatMessageListProps) {
  if (messages.length === 0) return <EmptyState />;

  return (
    <div className="rounded-box bg-base-200 flex min-h-[34rem] flex-col gap-5 overflow-y-auto p-5">
      {messages.map((message, index) => {
        const key = `${message.role}-${index}`;
        if (message.role === "human") {
          return (
            <div className="chat chat-end" key={key}>
              <div className="chat-bubble chat-bubble-primary">
                {message.content}
              </div>
            </div>
          );
        }

        return (
          <div className="chat chat-start" key={key}>
            <div className="chat-header">AI EN</div>
            {message.reasoning ? (
              <div className="chat-bubble bg-base-300 text-base-content/70 mb-2 text-xs">
                {message.reasoning}
              </div>
            ) : null}
            <div className="chat-bubble bg-base-100 shadow">
              {message.content ? (
                <MarkdownMessage content={message.content} />
              ) : (
                <span className="loading loading-dots loading-sm" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
