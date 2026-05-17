import clsx from "clsx";
import type { AppNavigationItem } from "../../shared/navigation";

export type NavigationPillProps = {
  readonly activePath: string;
  readonly item: AppNavigationItem;
};

export function NavigationPill({ activePath, item }: NavigationPillProps) {
  const Icon = item.icon;

  return (
    <a
      className={clsx(
        "btn btn-sm rounded-full",
        activePath === item.path
          ? "btn-primary"
          : "btn-ghost text-base-content/70",
      )}
      href={item.path}
    >
      <Icon aria-hidden="true" size={16} />
      <span className="hidden lg:inline">{item.label}</span>
    </a>
  );
}
