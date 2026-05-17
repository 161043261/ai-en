import type { StoreProvider } from "../../shared/config";
import type { Token, UserProfile, UserUpdate, WebUser } from "../../shared/api";

export type AuthSessionState = {
  readonly user: WebUser | null;
};

export type AuthSession = {
  readonly getAccessToken: () => string | undefined;
  readonly getRefreshToken: () => string | undefined;
  readonly getState: () => AuthSessionState;
  readonly logout: () => void;
  readonly provider: StoreProvider;
  readonly setUser: (user: WebUser) => void;
  readonly subscribe: (listener: () => void) => () => void;
  readonly updateToken: (token: Token) => void;
  readonly updateUser: (user: UserProfile | UserUpdate) => void;
};
