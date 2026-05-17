import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { ProviderProps } from "../providers/provider.types";

export type TanstackDataProviderProps = ProviderProps & {
  readonly queryClient: QueryClient;
};

export function TanstackDataProvider({
  children,
  queryClient,
}: TanstackDataProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
