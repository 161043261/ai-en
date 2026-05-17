import { Flame, Sparkles } from "lucide-react";
import { useAuthSession } from "../../features/auth";
import { useAppServices } from "../use-app-services";
import { appNavigationItems } from "../../shared/navigation";
import { MetricPill } from "./metric-pill";
import { NavigationPill } from "./navigation-pill";
import { ProfileMenu } from "./profile-menu";

export type AppHeaderProps = {
  readonly activePath: string;
};

export function AppHeader({ activePath }: AppHeaderProps) {
  const { session } = useAppServices();
  const { user } = useAuthSession(session);

  return (
    <header className="border-base-300 bg-base-100/90 sticky top-0 z-20 border-b backdrop-blur">
      <div className="navbar mx-auto max-w-7xl px-4">
        <div className="navbar-start gap-3">
          <a className="btn btn-primary btn-square text-xl font-black" href="/">
            E
          </a>
          <span className="hidden text-xl font-black md:inline">AI EN</span>
        </div>
        <nav aria-label="Primary navigation" className="navbar-center gap-2">
          {appNavigationItems.map((item) => (
            <NavigationPill
              activePath={activePath}
              item={item}
              key={item.path}
            />
          ))}
        </nav>
        <div className="navbar-end gap-2">
          <div className="hidden gap-2 xl:flex">
            <MetricPill
              icon={Sparkles}
              label="Words learned"
              value={user?.wordNumber ?? 0}
            />
            <MetricPill
              icon={Flame}
              label="Learning streak"
              value={user?.dayNumber ?? 0}
            />
          </div>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
