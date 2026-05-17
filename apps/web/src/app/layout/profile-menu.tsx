import { LogOut, Settings } from "lucide-react";
import { useAuthSession } from "../../features/auth";
import { useAppServices } from "../use-app-services";
import { UserAvatar } from "./user-avatar";

export function ProfileMenu() {
  const { session } = useAppServices();
  const { user } = useAuthSession(session);
  const name = user?.name ?? "Guest";
  const bio = user?.bio ?? "Sign in to sync progress and learning streaks.";

  return (
    <details className="dropdown dropdown-end">
      <summary className="btn btn-ghost rounded-full">
        <UserAvatar avatarUrl={user?.avatar ?? undefined} name={name} />
        <span className="hidden max-w-28 truncate text-sm font-bold md:inline">
          {name}
        </span>
      </summary>
      <div className="dropdown-content card card-compact bg-base-100 z-10 mt-3 w-80 shadow-xl">
        <div className="card-body gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar avatarUrl={user?.avatar ?? undefined} name={name} />
            <div className="min-w-0">
              <h2 className="truncate font-bold">{name}</h2>
              <p className="text-base-content/60 truncate text-sm">{bio}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="stat rounded-box bg-base-200 p-3">
              <div className="stat-title text-xs">Words</div>
              <div className="stat-value text-xl">{user?.wordNumber ?? 0}</div>
            </div>
            <div className="stat rounded-box bg-base-200 p-3">
              <div className="stat-title text-xs">Streak</div>
              <div className="stat-value text-xl">{user?.dayNumber ?? 0}</div>
            </div>
          </div>
          <div className="card-actions grid grid-cols-2">
            <a className="btn btn-outline btn-sm" href="/setting/index">
              <Settings aria-hidden="true" size={16} />
              Profile
            </a>
            <button
              className="btn btn-error btn-sm"
              onClick={session.logout}
              type="button"
            >
              <LogOut aria-hidden="true" size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}
