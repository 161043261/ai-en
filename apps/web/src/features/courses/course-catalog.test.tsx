import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { AppServicesProvider } from "../../app/app-services-context";
import { createAppServices } from "../../app/app-services";
import type { AppConfig } from "../../shared/config";
import { CourseCatalog } from ".";

const testConfig: AppConfig = {
  aiApiBaseUrl: "/ai/v1",
  dataProvider: "swr",
  requestTimeoutMs: 50_000,
  routerProvider: "react-router",
  serverApiBaseUrl: "/api/v1",
  socketBaseUrl: "http://localhost:3000",
  storeProvider: "zustand",
};

const course = {
  description: "Build core vocabulary.",
  id: "course-1",
  name: "Starter Vocabulary",
  price: "19.9",
  teacher: "AI Coach",
  url: "/uploads/course.png",
  value: "starter",
};

function successResponse(data: unknown, path: string): Response {
  return new Response(
    JSON.stringify({
      code: 200,
      data,
      message: "ok",
      path,
      success: true,
      timestamp: "2026-05-17T00:00:00.000Z",
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 },
  );
}

describe("CourseCatalog", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  test("loads courses and opens auth when a guest purchases", async () => {
    const fetchMock: typeof fetch = async () =>
      successResponse([course], "/course/list");
    vi.stubGlobal("fetch", fetchMock);

    const services = createAppServices({
      config: testConfig,
      navigateHome: vi.fn(),
    });

    render(
      <AppServicesProvider services={services}>
        <CourseCatalog />
      </AppServicesProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: course.name }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Purchase course" }));

    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
  });
});
