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
import type { AppConfig } from "../../shared/config";
import { WordBook } from ".";

const testConfig: AppConfig = {
  aiApiBaseUrl: "/ai/v1",
  dataProvider: "swr",
  requestTimeoutMs: 50_000,
  routerProvider: "react-router",
  serverApiBaseUrl: "/api/v1",
  socketBaseUrl: "http://localhost:3000",
  storeProvider: "zustand",
};

const word = {
  createdAt: "2026-05-17T00:00:00.000Z",
  definition: "Artificial intelligence.",
  gre: true,
  id: "word-1",
  translation: "<strong>AI</strong>",
  updatedAt: "2026-05-17T00:00:00.000Z",
  word: "ai",
};

function successResponse(data: unknown): Response {
  return new Response(
    JSON.stringify({
      code: 200,
      data,
      message: "ok",
      path: "/word-book",
      success: true,
      timestamp: "2026-05-17T00:00:00.000Z",
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 },
  );
}

describe("WordBook", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  test("loads words and sends selected filters only", async () => {
    const urls: string[] = [];
    const fetchMock: typeof fetch = async (input) => {
      urls.push(input instanceof Request ? input.url : String(input));
      return successResponse({ list: [word], total: 1 });
    };
    vi.stubGlobal("fetch", fetchMock);
    const services = createAppServices({
      config: testConfig,
      navigateHome: vi.fn(),
    });

    render(
      <AppServicesProvider services={services}>
        <WordBook />
      </AppServicesProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: "ai" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "GRE" }));

    await waitFor(() => {
      expect(urls.at(-1)).toContain("gre=true");
    });
    expect(urls.at(-1)).not.toContain("cet4=false");
  });
});
