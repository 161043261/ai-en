import { createAuthSession, type AuthSession } from "../features/auth";
import { createAppApi, type AppApi } from "../shared/api/app-api";
import { createApiClients, type ApiClients } from "../shared/api/api-clients";
import type { AppConfig } from "../shared/config";
import {
  createChatStream,
  createBrowserSocket,
  createSocketLifecycle,
  type ChatStream,
  type SocketLifecycle,
} from "../shared/realtime";

export type AppServices = {
  readonly api: AppApi;
  readonly apiClients: ApiClients;
  readonly chatStream: ChatStream;
  readonly config: AppConfig;
  readonly session: AuthSession;
  readonly socketLifecycle: SocketLifecycle;
};

export type AppServicesOptions = {
  readonly config: AppConfig;
  readonly navigateHome: () => void;
};

export function createAppServices(options: AppServicesOptions): AppServices {
  const session = createAuthSession(options.config.storeProvider);
  const apiClients = createApiClients({
    config: options.config,
    onAuthExpired: () => {
      session.logout();
      options.navigateHome();
    },
    session,
  });

  return {
    api: createAppApi(apiClients),
    apiClients,
    chatStream: createChatStream({ baseUrl: options.config.serverApiBaseUrl }),
    config: options.config,
    session,
    socketLifecycle: createSocketLifecycle({
      createSocket: createBrowserSocket,
      url: options.config.socketBaseUrl,
    }),
  };
}
