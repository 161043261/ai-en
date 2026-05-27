import { createRoot } from "react-dom/client";
import { createAppRoot } from "./app/app-root";
import "./index.css";
import { parseProviderEnv } from "./shared/config";
import { ErrorState } from "./shared/ui";

import { init, pluginEnable } from "@lark.js/sentry";
import PerformancePlugin from "@lark.js/sentry/plugins/perf";
import ScreenRecordPlugin from "@lark.js/sentry/plugins/record";
import ExposurePlugin from "@lark.js/sentry/plugins/exposure";
import {
  ReactErrorBoundary,
  type ReactErrorBoundaryProps,
} from "@lark.js/sentry/react";

if (!import.meta.env.DEV) {
  init({ dsn: "/sentry", visitorId: "" });
  pluginEnable(PerformancePlugin);
  pluginEnable(ScreenRecordPlugin);
  pluginEnable(ExposurePlugin);
}

const boundaryProps: ReactErrorBoundaryProps = {
  fallback: <ErrorState />,
};

const AppRoot = createAppRoot(parseProviderEnv(import.meta.env));

const rootElement = document.getElementById("root");

if (!(rootElement instanceof HTMLElement)) {
  throw new Error("Root element was not found.");
}

async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) {
    return;
  }

  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    import.meta.env.DEV ? (
      <AppRoot />
    ) : (
      <ReactErrorBoundary {...boundaryProps}>
        <AppRoot />
      </ReactErrorBoundary>
    ),
  );
});
