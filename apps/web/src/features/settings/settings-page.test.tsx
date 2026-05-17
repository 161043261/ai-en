import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createAppServices } from "../../app/app-services";
import { AppServicesProvider } from "../../app/app-services-context";
import type { WebUser } from "../../shared/api";
import type { AppConfig } from "../../shared/config";
import { SettingsProfile } from ".";

const testConfig: AppConfig = {
  aiApiBaseUrl: "/ai/v1",
  dataProvider: "swr",
  requestTimeoutMs: 50_000,
  routerProvider: "react-router",
  serverApiBaseUrl: "/api/v1",
  socketBaseUrl: "http://localhost:3000",
  storeProvider: "zustand",
};

const user: WebUser = {
  createdAt: "2026-05-17T00:00:00.000Z",
  dayNumber: 2,
  email: "learner@example.com",
  id: "user-1",
  isTimingTask: false,
  lastLoginAt: null,
  name: "Learner",
  phone: "13000000000",
  timingTaskTime: "08:00:00",
  token: { accessToken: "access-token", refreshToken: "refresh-token" },
  updatedAt: "2026-05-17T00:00:00.000Z",
  wordNumber: 12,
};

const updatedProfile = {
  ...user,
  email: "next@example.com",
  name: "Next Learner",
};

function successResponse(data: unknown): Response {
  return new Response(
    JSON.stringify({
      code: 200,
      data,
      message: "ok",
      path: "/user/update-user",
      success: true,
      timestamp: "2026-05-17T00:00:00.000Z",
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 },
  );
}

describe("SettingsProfile", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  test("updates profile data and refreshes the auth session", async () => {
    let body = "";
    const fetchMock: typeof fetch = async (_input, init) => {
      body = String(init?.body ?? "");
      return successResponse(updatedProfile);
    };
    vi.stubGlobal("fetch", fetchMock);
    const services = createAppServices({
      config: testConfig,
      navigateHome: vi.fn(),
    });
    services.session.setUser(user);

    render(
      <AppServicesProvider services={services}>
        <SettingsProfile />
      </AppServicesProvider>,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Next Learner" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(services.session.getState().user?.name).toBe("Next Learner");
    });
    expect(body).toContain('"name":"Next Learner"');
  });

  test("rejects invalid avatar files before uploading", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const services = createAppServices({
      config: testConfig,
      navigateHome: vi.fn(),
    });
    services.session.setUser(user);

    render(
      <AppServicesProvider services={services}>
        <SettingsProfile />
      </AppServicesProvider>,
    );

    const input = screen.getByLabelText("Select avatar");
    const file = new File(["avatar"], "avatar.gif", { type: "image/gif" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(
      await screen.findByText("Avatar must be a png, jpg, or webp image."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
