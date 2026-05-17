import { Inbox } from "lucide-react";

export function EmptyState() {
  return (
    <section className="hero rounded-box bg-base-200 min-h-72">
      <div className="hero-content text-center">
        <div className="flex max-w-md flex-col items-center gap-3">
          <Inbox aria-hidden="true" size={36} />
          <h2 className="text-xl font-bold">Nothing here yet</h2>
          <p className="text-base-content/70">
            This area is ready for the next migration milestone.
          </p>
        </div>
      </div>
    </section>
  );
}
