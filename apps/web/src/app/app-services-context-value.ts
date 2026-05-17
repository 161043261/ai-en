import { createContext } from "react";
import type { AppServices } from "./app-services";

export const AppServicesContext = createContext<AppServices | null>(null);
