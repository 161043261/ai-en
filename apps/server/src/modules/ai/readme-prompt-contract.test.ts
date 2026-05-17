import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { chatRoles } from "./prompts.js";

const readmePath = new URL("../../../README.md", import.meta.url);

const extractReadmePromptRoles = async () => {
  const readme = await readFile(readmePath, "utf8");
  const line =
    readme
      .split("\n")
      .find((item) => item.startsWith("- Prompt role order is ")) ?? "";
  return [...line.matchAll(/`([^`]+)`/gu)].map((match) => match[1]);
};

describe("README prompt contract", () => {
  test("keeps documented prompt role order in sync with code", async () => {
    await expect(extractReadmePromptRoles()).resolves.toEqual([...chatRoles]);
  });
});
