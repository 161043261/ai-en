import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createAppRoot } from "./app/app-root";
import "./index.css";
import { parseProviderEnv } from "./shared/config";
// import { init, larkEnable } from "@lark-sentry/core";
// import PerformancePlugin from "@lark-sentry/core/plugins/perf";
// import ScreenRecordPlugin from "@lark-sentry/core/plugins/record";
// import ExposurePlugin from "@lark-sentry/core/plugins/exposure";

// init({ dsn: "/api/log" });
// larkEnable(PerformancePlugin);
// larkEnable(ScreenRecordPlugin);
// larkEnable(ExposurePlugin);

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
    <StrictMode>
      <AppRoot />
    </StrictMode>,
  );
});
