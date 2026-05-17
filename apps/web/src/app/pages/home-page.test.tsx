import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import type { AppConfig } from "../../shared/config";
import { createAppRoot } from "../app-root";

const config: AppConfig = {
  aiApiBaseUrl: "/ai/v1",
  dataProvider: "swr",
  requestTimeoutMs: 50_000,
  routerProvider: "react-router",
  serverApiBaseUrl: "/api/v1",
  socketBaseUrl: "http://localhost:3000",
  storeProvider: "zustand",
};

describe("HomePage", () => {
  afterEach(() => {
    cleanup();
    window.history.pushState({}, "", "/");
  });

  test("opens the migrated authentication dialog", async () => {
    const AppRoot = createAppRoot(config);
    render(<AppRoot />);

    fireEvent.click(
      await screen.findByRole("button", { name: /start learning/i }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Create a new account" }),
    );

    expect(
      screen.getByRole("heading", { name: "Create your account" }),
    ).toBeInTheDocument();
  });

  test("renders the vocabulary marquee in the home hero", async () => {
    const AppRoot = createAppRoot(config);
    render(<AppRoot />);

    expect(
      await screen.findByRole("region", { name: /english word marquee/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("fluent").length).toBeGreaterThan(0);
  });
});
