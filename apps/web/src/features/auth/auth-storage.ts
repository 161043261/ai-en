import { z } from "zod";
import { WebUserSchema } from "../../shared/api/user-schema";
import type { AuthSessionState } from "./auth-session.types";

const STORAGE_KEY = "ai-en.auth-session";

const AuthSessionStateSchema = z.object({
  user: WebUserSchema.nullable(),
});

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function loadAuthSessionState(): AuthSessionState {
  const storage = getStorage();
  const rawValue = storage?.getItem(STORAGE_KEY);

  if (!rawValue) {
    return { user: null };
  }

  return AuthSessionStateSchema.parse(JSON.parse(rawValue));
}

export function saveAuthSessionState(state: AuthSessionState): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}
