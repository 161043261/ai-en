import { z } from "zod";

const ProviderEnvSchema = z
  .object({
    ROUTER_PROVIDER: z
      .enum(["react-router", "tanstack"])
      .default("react-router"),
    SERVER_API_BASE_URL: z.string().min(1).default("/api/v1"),
    STORE_PROVIDER: z.enum(["zustand", "jotai"]).default("zustand"),
    SWR_PROVIDER: z.enum(["swr", "tanstack"]).default("swr"),
    REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(50_000),
    SOCKET_BASE_URL: z.string().min(1).default("http://localhost:3000"),
  })
  .transform((value) => ({
    dataProvider: value.SWR_PROVIDER,
    requestTimeoutMs: value.REQUEST_TIMEOUT_MS,
    routerProvider: value.ROUTER_PROVIDER,
    serverApiBaseUrl: value.SERVER_API_BASE_URL,
    socketBaseUrl: value.SOCKET_BASE_URL,
    storeProvider: value.STORE_PROVIDER,
  }));

export type AppConfig = z.infer<typeof ProviderEnvSchema>;
export type DataProvider = AppConfig["dataProvider"];
export type RouterProvider = AppConfig["routerProvider"];
export type StoreProvider = AppConfig["storeProvider"];

export function parseProviderEnv(input: unknown): AppConfig {
  return ProviderEnvSchema.parse(input);
}
