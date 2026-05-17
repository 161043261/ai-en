import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import type { WebUser } from "../../shared/api";
import { createAuthSession } from "./auth-session";
import { useAuthSession } from "./use-auth-session";

const user: WebUser = {
  createdAt: "2026-01-01T00:00:00.000Z",
  dayNumber: 2,
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
  wordNumber: 8,
};

describe("useAuthSession", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test("rerenders when the session changes", () => {
    const session = createAuthSession("zustand");

    function SessionProbe() {
      const state = useAuthSession(session);
      return <span>{state.user?.name ?? "Guest"}</span>;
    }

    render(<SessionProbe />);
    expect(screen.getByText("Guest")).toBeInTheDocument();

    act(() => {
      session.setUser(user);
    });

    expect(screen.getByText("Ada")).toBeInTheDocument();
  });
});
