import { Provider as JotaiProvider } from "jotai";
import type { ProviderProps } from "../providers/provider.types";

export function JotaiStateProvider({ children }: ProviderProps) {
  return <JotaiProvider>{children}</JotaiProvider>;
}
