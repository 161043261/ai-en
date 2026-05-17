import type { Token, UserProfile, UserUpdate, WebUser } from "../../shared/api";
import type { AuthSessionState } from "./auth-session.types";

export function applyTokenUpdate(
  state: AuthSessionState,
  token: Token,
): AuthSessionState {
  if (!state.user) {
    return state;
  }

  return {
    user: {
      ...state.user,
      token,
    },
  };
}

export function applyUserUpdate(
  state: AuthSessionState,
  userUpdate: UserProfile | UserUpdate,
): AuthSessionState {
  if (!state.user) {
    return state;
  }

  return {
    user: {
      ...state.user,
      ...userUpdate,
    },
  };
}

export function createAuthenticatedState(user: WebUser): AuthSessionState {
  return { user };
}

export function createLoggedOutState(): AuthSessionState {
  return { user: null };
}
