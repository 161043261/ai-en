import type { ProviderProps } from "../shared/providers/provider.types";
import type { AppServices } from "./app-services";
import { AppServicesContext } from "./app-services-context-value";

export type AppServicesProviderProps = ProviderProps & {
  readonly services: AppServices;
};

export function AppServicesProvider({
  children,
  services,
}: AppServicesProviderProps) {
  return (
    <AppServicesContext.Provider value={services}>
      {children}
    </AppServicesContext.Provider>
  );
}
