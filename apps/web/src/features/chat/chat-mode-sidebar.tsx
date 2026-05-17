import clsx from "clsx";
import { Bot } from "lucide-react";
import type { ChatMode, ChatRoleType } from "../../shared/api/chat-schema";

export type ChatModeSidebarProps = {
  readonly activeRole: ChatRoleType | null;
  readonly modes: readonly ChatMode[];
  readonly selectRole: (role: ChatRoleType) => void;
};

export function ChatModeSidebar({
  activeRole,
  modes,
  selectRole,
}: ChatModeSidebarProps) {
  return (
    <aside className="card bg-base-200 shadow-sm">
      <div className="card-body gap-3">
        <h2 className="card-title text-base">
          <Bot aria-hidden="true" size={18} />
          Conversation roles
        </h2>
        <div className="flex flex-col gap-2">
          {modes.map((mode) => (
            <button
              className={clsx(
                "btn justify-start",
                activeRole === mode.role ? "btn-primary" : "btn-ghost",
              )}
              key={mode.id}
              onClick={() => {
                selectRole(mode.role);
              }}
              type="button"
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
