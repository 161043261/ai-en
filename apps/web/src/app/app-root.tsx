import type { ReactNode } from "react";
import type { AppConfig } from "../shared/config";
import { createAppProviders } from "./app-providers";
import { createAppRouter } from "./app-router";
import { createAppServices } from "./app-services";
import { AppServicesProvider } from "./app-services-context";
import { SocketLifecycleBridge } from "./socket-lifecycle-bridge";

export type AppRoot = () => ReactNode;

export function createAppRoot(config: AppConfig): AppRoot {
  const AppProviders = createAppProviders(config);
  const appRouter = createAppRouter(config.routerProvider);
  const services = createAppServices({
    config,
    navigateHome: appRouter.navigateHome,
  });

  return function AppRoot() {
    return (
      <AppProviders>
        <AppServicesProvider services={services}>
          <SocketLifecycleBridge />
          <appRouter.RouterView />
        </AppServicesProvider>
      </AppProviders>
    );
  };
}
