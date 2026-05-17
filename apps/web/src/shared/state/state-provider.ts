import type { StoreProvider } from "../config";
import { assertNever } from "../providers/assert-never";
import type { AppProvider } from "../providers/provider.types";
import { JotaiStateProvider } from "./jotai-state-provider";
import { ZustandStateProvider } from "./zustand-state-provider";

export function createStateProvider(provider: StoreProvider): AppProvider {
  switch (provider) {
    case "zustand":
      return ZustandStateProvider;
    case "jotai":
      return JotaiStateProvider;
    default:
      return assertNever(provider);
  }
}
