import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { AppServicesProvider } from "../../app/app-services-context";
import { createAppServices } from "../../app/app-services";
import type { AppServices } from "../../app/app-services";
import type { WebUser } from "../../shared/api";
import type { AppConfig } from "../../shared/config";
import { useLearningSession } from ".";

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
  dayNumber: 1,
  email: "learner@example.com",
  id: "user-1",
  isTimingTask: false,
  lastLoginAt: null,
  name: "Learner",
  phone: "13000000000",
  timingTaskTime: "09:00",
  token: { accessToken: "access-token", refreshToken: "refresh-token" },
  updatedAt: "2026-05-17T00:00:00.000Z",
  wordNumber: 3,
};

const word = {
  createdAt: "2026-05-17T00:00:00.000Z",
  definition: "A short artificial intelligence abbreviation.",
  id: "word-1",
  translation: "Artificial intelligence",
  updatedAt: "2026-05-17T00:00:00.000Z",
  word: "ai",
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

function LearningHarness() {
  const session = useLearningSession("course-1");

  if (session.isLoading) return <div>Loading</div>;
  if (!session.currentWord) {
    return (
      <button onClick={() => void session.saveMasteredWords()} type="button">
        Save mastered words
      </button>
    );
  }

  return (
    <div>
      <h1>{session.currentWord.word}</h1>
      {session.cells.map((cell, index) => (
        <input
          aria-label={`Letter ${index + 1}`}
          key={`${cell.expected}-${index}`}
          onChange={(event) => session.updateCell(index, event.target.value)}
          value={cell.input}
        />
      ))}
      <button
        disabled={!session.isComplete}
        onClick={session.next}
        type="button"
      >
        Next
      </button>
    </div>
  );
}

describe("useLearningSession", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  test("saves mastered words and refreshes the session word count", async () => {
    let saveBody = "";
    const fetchMock: typeof fetch = async (input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.endsWith("/learn/word/master")) {
        saveBody = String(init?.body ?? "");
        return successResponse({ wordNumber: 4 }, "/learn/word/master");
      }
      return successResponse([word], "/learn/word/course-1");
    };
    vi.stubGlobal("fetch", fetchMock);

    const services: AppServices = createAppServices({
      config: testConfig,
      navigateHome: vi.fn(),
    });
    services.session.setUser(user);

    render(
      <AppServicesProvider services={services}>
        <LearningHarness />
      </AppServicesProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: "ai" }),
    ).toBeInTheDocument();
    const firstLetter = await screen.findByLabelText("Letter 1");
    const secondLetter = await screen.findByLabelText("Letter 2");
    fireEvent.change(firstLetter, { target: { value: "a" } });
    fireEvent.change(secondLetter, { target: { value: "i" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Save mastered words" }),
    );

    await waitFor(() => {
      expect(services.session.getState().user?.wordNumber).toBe(4);
    });
    expect(saveBody).toContain('"wordIds":["word-1"]');
  });
});
