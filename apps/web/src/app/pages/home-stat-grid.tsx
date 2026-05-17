import { homeStats } from "./home-stats";

export type HomeStatGridProps = {
  readonly values?: readonly string[];
};

export function HomeStatGrid({ values }: HomeStatGridProps) {
  return (
    <section
      aria-label="Learning platform statistics"
      className="stats stats-vertical lg:stats-horizontal w-full shadow"
    >
      {homeStats.map((stat, index) => {
        const Icon = stat.icon;
        const value = values?.[index] ?? stat.displayValue;

        return (
          <div className="stat" key={stat.label}>
            <div className="stat-figure text-primary">
              <Icon aria-hidden="true" size={28} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-title">{stat.label}</div>
          </div>
        );
      })}
    </section>
  );
}
