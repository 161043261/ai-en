import { describe, expect, test, vi } from "vitest";
import { parseEnv } from "../../shared/config/env.js";
import {
  BochaSearchError,
  createBochaSearchForEnv,
  shouldUseBochaSearch,
} from "./bocha-search.js";

const createBochaEnv = (enabled: boolean) =>
  parseEnv({
    BOCHA_API_KEY: "bocha-key",
    BOCHA_ENABLED: enabled ? "true" : "false",
    BOCHA_SEARCH_URL: "https://api.bocha.example/search",
    JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
  });

describe("Bocha search feature flag", () => {
  test("uses search only when both env and request enable it", () => {
    expect(shouldUseBochaSearch(createBochaEnv(true), true)).toBe(true);
    expect(shouldUseBochaSearch(createBochaEnv(true), false)).toBe(false);
    expect(shouldUseBochaSearch(createBochaEnv(true), undefined)).toBe(false);
    expect(shouldUseBochaSearch(createBochaEnv(false), true)).toBe(false);
  });

  test("validates Bocha configuration before network calls", async () => {
    const fetchImpl = vi.fn();
    const config = parseEnv({
      BOCHA_ENABLED: "true",
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
    });

    await expect(
      createBochaSearchForEnv({ config, query: "langchain", fetchImpl }),
    ).rejects.toThrow();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test("formats successful Bocha search results", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        data: {
          webPages: {
            value: [
              {
                dateLastCrawled: "2026-05-17",
                name: "LangChain docs",
                siteIcon: "https://example.com/icon.png",
                siteName: "LangChain",
                summary: "Build LLM apps\nwith TypeScript.",
                url: "https://docs.langchain.com",
              },
            ],
          },
        },
      }),
    );

    const result = await createBochaSearchForEnv({
      config: createBochaEnv(true),
      query: "langchain",
      fetchImpl,
    });

    expect(result).toContain("Title: LangChain docs");
    expect(result).toContain("Summary: Build LLM apps with TypeScript.");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.bocha.example/search",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("returns typed errors for non-success Bocha responses", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response("bad gateway", {
          status: 502,
        }),
    );

    await expect(
      createBochaSearchForEnv({
        config: createBochaEnv(true),
        query: "langchain",
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(BochaSearchError);
  });
});
