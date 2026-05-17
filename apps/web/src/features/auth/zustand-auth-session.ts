import { createStore } from "zustand/vanilla";
import type { WebUser, Token, UserProfile, UserUpdate } from "../../shared/api";
import type { AuthSession } from "./auth-session.types";
import {
  applyTokenUpdate,
  applyUserUpdate,
  createAuthenticatedState,
  createLoggedOutState,
} from "./auth-session-actions";
import { loadAuthSessionState, saveAuthSessionState } from "./auth-storage";

export function createZustandAuthSession(): AuthSession {
  const store = createStore(() => loadAuthSessionState());
  const commit = (state: ReturnType<typeof store.getState>) => {
    store.setState(state, true);
    saveAuthSessionState(state);
  };

  return {
    getAccessToken: () => store.getState().user?.token.accessToken,
    getRefreshToken: () => store.getState().user?.token.refreshToken,
    getState: store.getState,
    logout: () => commit(createLoggedOutState()),
    provider: "zustand",
    setUser: (user: WebUser) => commit(createAuthenticatedState(user)),
    subscribe: store.subscribe,
    updateToken: (token: Token) =>
      commit(applyTokenUpdate(store.getState(), token)),
    updateUser: (user: UserProfile | UserUpdate) =>
      commit(applyUserUpdate(store.getState(), user)),
  };
}
