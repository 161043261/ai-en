import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { AppConfig } from "../shared/config";
import { createAppRoot } from "./app-root";

const baseConfig: Omit<AppConfig, "routerProvider"> = {
  aiApiBaseUrl: "/ai/v1",
  dataProvider: "swr",
  requestTimeoutMs: 50_000,
  serverApiBaseUrl: "/api/v1",
  socketBaseUrl: "http://localhost:3000",
  storeProvider: "zustand",
} as const;

const providerConfigs: readonly AppConfig[] = [
  {
    ...baseConfig,
    routerProvider: "react-router",
  },
  {
    ...baseConfig,
    routerProvider: "tanstack",
  },
];

const routeCases = [
  { path: "/", title: "Learn English with an AI scene partner." },
  { path: "/chat/index", title: "AI conversation studio" },
  { path: "/courses/index", title: "Curated vocabulary tracks" },
  {
    path: "/courses/learn/course-1/intro",
    title: "intro",
  },
  { path: "/word-book/index", title: "Explore the word book" },
  { path: "/setting/index", title: "Sign in to manage settings" },
] as const;

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

describe("application routes", () => {
  beforeEach(() => {
    const fetchMock: typeof fetch = async (input) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.endsWith("/course/list"))
        return successResponse([], "/course/list");
      if (url.includes("/learn/word/"))
        return successResponse([], "/learn/word");
      if (url.includes("/word-book")) {
        return successResponse({ list: [], total: 0 }, "/word-book");
      }
      return successResponse(null, url);
    };

    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.history.pushState({}, "", "/");
  });

  test.each(providerConfigs)(
    "reaches migrated routes with $routerProvider",
    async (config) => {
      for (const routeCase of routeCases) {
        window.history.pushState({}, "", routeCase.path);
        const AppRoot = createAppRoot(config);

        render(<AppRoot />);

        expect(
          await screen.findByRole("heading", { name: routeCase.title }),
        ).toBeInTheDocument();

        cleanup();
      }
    },
  );

  test.each(providerConfigs)(
    "rejects invalid learning params before fetching words with $routerProvider",
    async (config) => {
      let learningRequests = 0;
      const fetchMock: typeof fetch = async (input) => {
        const url = input instanceof Request ? input.url : String(input);
        if (url.includes("/learn/word/")) learningRequests += 1;
        return successResponse([], "/learn/word");
      };
      vi.stubGlobal("fetch", fetchMock);
      window.history.pushState({}, "", "/courses/learn/course-1/%20");
      const AppRoot = createAppRoot(config);

      render(<AppRoot />);

      expect(
        await screen.findByText(
          "Unable to load this area. Please try again later.",
        ),
      ).toBeInTheDocument();
      expect(learningRequests).toBe(0);
    },
  );
});
