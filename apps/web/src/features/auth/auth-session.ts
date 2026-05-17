import type { StoreProvider } from "../../shared/config";
import { assertNever } from "../../shared/providers/assert-never";
import type { AuthSession } from "./auth-session.types";
import { createJotaiAuthSession } from "./jotai-auth-session";
import { createZustandAuthSession } from "./zustand-auth-session";

export function createAuthSession(provider: StoreProvider): AuthSession {
  switch (provider) {
    case "jotai":
      return createJotaiAuthSession();
    case "zustand":
      return createZustandAuthSession();
    default:
      return assertNever(provider);
  }
}
