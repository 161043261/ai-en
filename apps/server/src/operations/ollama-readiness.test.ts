import { describe, expect, test } from "vitest";
import {
  checkOllamaModels,
  listRequiredOllamaModels,
} from "./ollama-readiness.js";

const createConfig = (fetchImpl: typeof fetch) => ({
  baseUrl: "http://127.0.0.1:11434",
  chatModel: "qwen3.5",
  fetchImpl,
  reasonerModel: "deepseek-r1",
});

describe("Ollama readiness", () => {
  test("deduplicates required model names", () => {
    expect(listRequiredOllamaModels("qwen3.5", "qwen3.5")).toEqual([
      "qwen3.5",
    ]);
  });

  test("accepts installed models with explicit tags", async () => {
    await expect(
      checkOllamaModels(
        createConfig(async () =>
          Response.json({
            models: [
              { name: "qwen3.5:latest" },
              { name: "deepseek-r1:latest" },
            ],
          }),
        ),
      ),
    ).resolves.toEqual({
      message: "ollama models available",
      ok: true,
    });
  });

  test("reports missing local models", async () => {
    await expect(
      checkOllamaModels(
        createConfig(async () =>
          Response.json({ models: [{ name: "qwen3.5:latest" }] }),
        ),
      ),
    ).resolves.toEqual({
      message: "missing Ollama models: deepseek-r1",
      ok: false,
    });
  });

  test("reports unavailable local service", async () => {
    await expect(
      checkOllamaModels(
        createConfig(
          async () =>
            new Response("unavailable", {
              status: 503,
            }),
        ),
      ),
    ).resolves.toEqual({
      message: "ollama unavailable: 503",
      ok: false,
    });
  });
});
