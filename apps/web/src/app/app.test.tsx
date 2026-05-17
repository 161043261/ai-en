import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { App } from "../";

test("renders the application shell", () => {
  render(<App />);

  expect(
    // MUST `AI EN`
    screen.getByRole("main", { name: "AI EN" }),
  ).toBeInTheDocument();
});
