import type { ReactNode } from "react";
import { AppHeader } from "./app-header";

export type AppLayoutProps = {
  readonly activePath: string;
  readonly children: ReactNode;
};

export function AppLayout({ activePath, children }: AppLayoutProps) {
  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <AppHeader activePath={activePath} />
      <main aria-label="AI EN" className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
