import { createElement } from "react";
import type { DataProvider } from "../config";
import { assertNever } from "../providers/assert-never";
import type { AppProvider } from "../providers/provider.types";
import { createQueryClient } from "./query-client";
import { SwrDataProvider } from "./swr-data-provider";
import { TanstackDataProvider } from "./tanstack-data-provider";

export function createDataProvider(provider: DataProvider): AppProvider {
  switch (provider) {
    case "swr":
      return SwrDataProvider;
    case "tanstack": {
      const queryClient = createQueryClient();
      return ({ children }) =>
        createElement(TanstackDataProvider, { children, queryClient });
    }
    default:
      return assertNever(provider);
  }
}
