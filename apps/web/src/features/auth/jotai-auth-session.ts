import { atom, createStore } from "jotai";
import type { Token, UserProfile, UserUpdate, WebUser } from "../../shared/api";
import type { AuthSessionState, AuthSession } from "./auth-session.types";
import {
  applyTokenUpdate,
  applyUserUpdate,
  createAuthenticatedState,
  createLoggedOutState,
} from "./auth-session-actions";
import { loadAuthSessionState, saveAuthSessionState } from "./auth-storage";

const authSessionAtom = atom<AuthSessionState>(createLoggedOutState());

export function createJotaiAuthSession(): AuthSession {
  const store = createStore();
  store.set(authSessionAtom, loadAuthSessionState());
  const getState = () => store.get(authSessionAtom);
  const commit = (state: AuthSessionState) => {
    store.set(authSessionAtom, state);
    saveAuthSessionState(state);
  };

  return {
    getAccessToken: () => getState().user?.token.accessToken,
    getRefreshToken: () => getState().user?.token.refreshToken,
    getState,
    logout: () => commit(createLoggedOutState()),
    provider: "jotai",
    setUser: (user: WebUser) => commit(createAuthenticatedState(user)),
    subscribe: (listener) => store.sub(authSessionAtom, listener),
    updateToken: (token: Token) => commit(applyTokenUpdate(getState(), token)),
    updateUser: (user: UserProfile | UserUpdate) =>
      commit(applyUserUpdate(getState(), user)),
  };
}
