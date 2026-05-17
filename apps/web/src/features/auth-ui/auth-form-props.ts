import type { AuthMode } from "./auth-mode";

export type AuthFormProps = {
  readonly close: () => void;
  readonly setMode: (mode: AuthMode) => void;
};
