import { AuthDialog } from "../auth-ui";
import { ErrorState, LoadingState } from "../../shared/ui";
import { ChatAuthGate } from "./chat-auth-gate";
import { ChatComposer } from "./chat-composer";
import { ChatMessageList } from "./chat-message-list";
import { ChatModeSidebar } from "./chat-mode-sidebar";
import { ChatStreamError } from "./chat-stream-error";
import { useChatExperience } from "./use-chat-experience";

export function ChatExperience() {
  const state = useChatExperience();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="badge badge-primary badge-soft mb-3">Realtime chat</div>
        <h1 className="text-4xl font-black">AI conversation studio</h1>
        <p className="text-base-content/65 mt-3 max-w-2xl">
          Switch roles, stream safe AI responses, and practice with typed
          realtime boundaries.
        </p>
      </header>
      {state.error ? <ErrorState /> : null}
      {state.streamError && state.lastPayload ? (
        <ChatStreamError
          message={state.streamError}
          retry={() => {
            if (state.lastPayload) state.sendMessage(state.lastPayload, true);
          }}
        />
      ) : null}
      {!state.user ? (
        <ChatAuthGate openAuth={() => state.setIsAuthOpen(true)} />
      ) : null}
      <div className="grid gap-5 lg:grid-cols-[17rem_1fr]">
        <ChatModeSidebar
          activeRole={state.activeRole}
          modes={state.modes}
          selectRole={state.setActiveRole}
        />
        <section className="flex flex-col gap-5">
          {state.isLoading ? (
            <LoadingState />
          ) : (
            <ChatMessageList messages={state.messages} />
          )}
          <ChatComposer
            isDisabled={!state.user || !state.activeRole}
            isStreaming={state.isStreaming}
            onSend={state.sendMessage}
          />
        </section>
      </div>
      <AuthDialog
        close={() => state.setIsAuthOpen(false)}
        isOpen={state.isAuthOpen}
      />
    </div>
  );
}
