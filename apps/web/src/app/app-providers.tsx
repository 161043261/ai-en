import type { AppConfig } from "../shared/config";
import { createDataProvider } from "../shared/data";
import type { AppProvider, ProviderProps } from "../shared/providers/provider.types";
import { createStateProvider } from "../shared/state";

export function createAppProviders(config: AppConfig): AppProvider {
  const DataProvider = createDataProvider(config.dataProvider);
  const StateProvider = createStateProvider(config.storeProvider);

  return function AppProviders({ children }: ProviderProps) {
    return (
      <StateProvider>
        <DataProvider>{children}</DataProvider>
      </StateProvider>
    );
  };
}
