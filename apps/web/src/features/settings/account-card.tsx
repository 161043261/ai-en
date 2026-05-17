import { LogOut } from "lucide-react";
import type { WebUser } from "../../shared/api";

export type AccountCardProps = {
  readonly logout: () => void;
  readonly user: WebUser;
};

export function AccountCard({ logout, user }: AccountCardProps) {
  return (
    <section className="card bg-base-100 shadow-xl">
      <div className="card-body gap-4">
        <h2 className="card-title">Account</h2>
        <div className="stats stats-vertical bg-base-200">
          <div className="stat">
            <div className="stat-title">Words mastered</div>
            <div className="stat-value text-primary">{user.wordNumber}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Practice days</div>
            <div className="stat-value text-secondary">{user.dayNumber}</div>
          </div>
        </div>
        <button
          className="btn btn-error btn-outline"
          onClick={logout}
          type="button"
        >
          <LogOut aria-hidden="true" size={18} />
          Sign out
        </button>
      </div>
    </section>
  );
}
