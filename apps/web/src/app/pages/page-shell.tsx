import type { LucideIcon } from "lucide-react";

export type PageShellProps = {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly kicker: string;
  readonly title: string;
};

export function PageShell({
  description,
  icon: Icon,
  kicker,
  title,
}: PageShellProps) {
  return (
    <section className="hero rounded-box bg-base-200 min-h-112">
      <div className="hero-content text-center">
        <div className="flex max-w-2xl flex-col items-center gap-5">
          <div className="badge badge-primary badge-lg gap-2">
            <Icon aria-hidden="true" size={18} />
            {kicker}
          </div>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            {title}
          </h1>
          <p className="text-base-content/70 text-lg leading-8">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
