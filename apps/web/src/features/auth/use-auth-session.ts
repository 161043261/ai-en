import { useSyncExternalStore } from "react";
import type { AuthSession, AuthSessionState } from "./auth-session.types";

export function useAuthSession(session: AuthSession): AuthSessionState {
  return useSyncExternalStore(
    session.subscribe,
    session.getState,
    session.getState,
  );
}
