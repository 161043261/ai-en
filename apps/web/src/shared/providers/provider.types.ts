import type { ReactNode } from "react";

export type ProviderProps = {
  readonly children: ReactNode;
};

export type AppProvider = (props: ProviderProps) => ReactNode;
