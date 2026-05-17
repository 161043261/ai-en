import { useContext } from "react";
import type { AppServices } from "./app-services";
import { AppServicesContext } from "./app-services-context-value";

export function useAppServices(): AppServices {
  const services = useContext(AppServicesContext);

  if (!services) {
    throw new Error("App services are not available.");
  }

  return services;
}
