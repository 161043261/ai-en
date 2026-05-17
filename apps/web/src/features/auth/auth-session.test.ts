import { beforeEach, describe, expect, test } from "vitest";
import type { StoreProvider } from "../../shared/config";
import type { WebUser } from "../../shared/api";
import { createAuthSession } from "./auth-session";

const providers: readonly StoreProvider[] = ["zustand", "jotai"];

const user: WebUser = {
  createdAt: "2026-01-01T00:00:00.000Z",
  dayNumber: 1,
  id: "user-1",
  isTimingTask: false,
  name: "Ada",
  phone: "10086",
  timingTaskTime: "09:00",
  token: {
    accessToken: "access-token",
    refreshToken: "refresh-token",
  },
  updatedAt: "2026-01-01T00:00:00.000Z",
  wordNumber: 0,
};

describe("createAuthSession", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test.each(providers)("keeps behavior stable for %s", (provider) => {
    const session = createAuthSession(provider);
    let notificationCount = 0;
    const unsubscribe = session.subscribe(() => {
      notificationCount += 1;
    });

    session.setUser(user);
    session.updateToken({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    expect(session.getAccessToken()).toBe("new-access-token");
    expect(session.getRefreshToken()).toBe("new-refresh-token");

    session.logout();

    expect(session.getState().user).toBeNull();
    expect(notificationCount).toBe(3);

    unsubscribe();
  });
});
