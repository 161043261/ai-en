import { describe, expect, test, vi } from "vitest";
import {
  createRequiredStagingEnvKeys,
  createStagingSmokeReport,
  parseStagingSmokeEnv,
} from "./staging-smoke.js";

const createJsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("staging smoke configuration", () => {
  test("parses the staging smoke environment", () => {
    expect(
      parseStagingSmokeEnv({
        AI_PROVIDER: "ollama",
        ALIPAY_ENABLED: "true",
        EMAIL_ENABLED: "true",
        STAGING_BASE_URL: "https://staging.example.com",
        STAGING_SMOKE_TIMEOUT_MS: "3000",
      }),
    ).toEqual({
      aiProvider: "ollama",
      alipayEnabled: true,
      baseUrl: "https://staging.example.com",
      emailEnabled: true,
      timeoutMs: 3000,
    });
  });

  test("declares DeepSeek staging environment keys", () => {
    expect(createRequiredStagingEnvKeys("deepseek")).toEqual([
      "DATABASE_URL",
      "REDIS_HOST",
      "MINIO_ENDPOINT",
      "MINIO_BUCKET",
      "PAYMENT_NOTIFY_SECRET",
      "DEEPSEEK_API_KEY",
    ]);
  });

  test("declares Ollama staging environment keys", () => {
    expect(createRequiredStagingEnvKeys("ollama")).toEqual([
      "DATABASE_URL",
      "REDIS_HOST",
      "MINIO_ENDPOINT",
      "MINIO_BUCKET",
      "PAYMENT_NOTIFY_SECRET",
      "OLLAMA_BASE_URL",
      "OLLAMA_MODEL",
    ]);
  });

  test("declares optional email and Alipay staging environment keys", () => {
    expect(
      createRequiredStagingEnvKeys("deepseek", {
        alipayEnabled: true,
        emailEnabled: true,
      }),
    ).toEqual([
      "DATABASE_URL",
      "REDIS_HOST",
      "MINIO_ENDPOINT",
      "MINIO_BUCKET",
      "EMAIL_HOST",
      "EMAIL_USER",
      "EMAIL_PASSWORD",
      "EMAIL_FROM",
      "ALIPAY_APP_ID",
      "ALIPAY_PRIVATE_KEY",
      "ALIPAY_PUBLIC_KEY",
      "ALIPAY_GATEWAY",
      "ALIPAY_NOTIFY_URL",
      "DEEPSEEK_API_KEY",
    ]);
  });
});

describe("staging smoke report", () => {
  test("marks automated checks as passed when health and readiness are green", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse(200, { ok: true }))
      .mockResolvedValueOnce(
        createJsonResponse(200, { data: { status: "ready" } }),
      );

    await expect(
      createStagingSmokeReport({
        baseUrl: "https://staging.example.com",
        fetchImpl,
      }),
    ).resolves.toMatchObject({
      status: "passed",
      automatedChecks: [
        { name: "health", ok: true },
        { name: "readiness", ok: true },
      ],
      manualChecks: [
        { name: "digest-email", status: "required" },
        { name: "avatar-upload", status: "required" },
        { name: "tracker-persist", status: "required" },
        { name: "payment-notify-boundary", status: "required" },
      ],
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://staging.example.com/api/v1/health",
      expect.objectContaining({
        signal: expect.objectContaining({ aborted: false }),
      }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://staging.example.com/api/v1/ready",
      expect.objectContaining({
        signal: expect.objectContaining({ aborted: false }),
      }),
    );
  });

  test("marks the report as failed when readiness is not green", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse(200, { ok: true }))
      .mockResolvedValueOnce(
        createJsonResponse(503, { data: { status: "not_ready" } }),
      );

    await expect(
      createStagingSmokeReport({
        baseUrl: "https://staging.example.com/",
        fetchImpl,
      }),
    ).resolves.toMatchObject({
      status: "failed",
      automatedChecks: [
        { name: "health", ok: true },
        { name: "readiness", ok: false, message: "expected 200, got 503" },
      ],
    });
  });
});
