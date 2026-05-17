import {
  Outlet as TanstackOutlet,
  useLocation as useTanstackLocation,
} from "@tanstack/react-router";
import {
  Outlet as ReactRouterOutlet,
  useLocation as useReactRouterLocation,
} from "react-router-dom";
import { AppLayout } from "./layout";

export function ReactRouterLayout() {
  const location = useReactRouterLocation();

  return (
    <AppLayout activePath={location.pathname}>
      <ReactRouterOutlet />
    </AppLayout>
  );
}

export function TanstackRouterLayout() {
  const location = useTanstackLocation();

  return (
    <AppLayout activePath={location.pathname}>
      <TanstackOutlet />
    </AppLayout>
  );
}
