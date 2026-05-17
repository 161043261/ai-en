import type { AppConfig } from "../config";
import { createApiClient, type ApiClient } from "../http";
import type { AuthSession } from "../../features/auth";
import { createResponseSchema } from "./response-schema";
import { TokenSchema } from "./user-schema";

export type ApiClients = {
  readonly ai: ApiClient;
  readonly refresh: ApiClient;
  readonly server: ApiClient;
};

export type ApiClientsOptions = {
  readonly config: AppConfig;
  readonly fetchImpl?: typeof fetch;
  readonly onAuthExpired: () => void;
  readonly session: AuthSession;
};

export function createApiClients(options: ApiClientsOptions): ApiClients {
  const fetchImpl = options.fetchImpl ?? fetch;
  const sharedOptions = {
    fetchImpl,
    timeoutMs: options.config.requestTimeoutMs,
  };
  const refresh = createApiClient({
    ...sharedOptions,
    baseUrl: options.config.serverApiBaseUrl,
  });

  return {
    ai: createApiClient({
      ...sharedOptions,
      baseUrl: options.config.aiApiBaseUrl,
    }),
    refresh,
    server: createApiClient({
      ...sharedOptions,
      baseUrl: options.config.serverApiBaseUrl,
      getAccessToken: options.session.getAccessToken,
      onAuthExpired: options.onAuthExpired,
      refreshAccessToken: async () => {
        const refreshToken = options.session.getRefreshToken();

        if (!refreshToken) {
          throw new Error("Refresh token is missing.");
        }

        const response = await refresh.post(
          "/user/refresh-token",
          createResponseSchema(TokenSchema),
          { body: { refreshToken } },
        );

        options.session.updateToken(response.data);
        return response.data.accessToken;
      },
    }),
  };
}
