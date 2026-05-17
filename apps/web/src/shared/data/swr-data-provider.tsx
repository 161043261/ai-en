import { SWRConfig } from "swr";
import type { ProviderProps } from "../providers/provider.types";

export function SwrDataProvider({ children }: ProviderProps) {
  return <SWRConfig>{children}</SWRConfig>;
}
