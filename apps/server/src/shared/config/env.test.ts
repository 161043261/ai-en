import { describe, expect, test } from "vitest";
import { parseEnv } from "./env.js";

describe("environment validation", () => {
  test("rejects invalid startup configuration", () => {
    expect(() =>
      parseEnv({
        JWT_SECRET: "short",
      }),
    ).toThrow();
  });

  test("parses numeric and boolean startup values", () => {
    const env = parseEnv({
      BOCHA_ENABLED: "true",
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
      MINIO_USE_SSL: "1",
      PORT: "4000",
      REDIS_PORT: "6380",
    });

    expect(env.PORT).toBe(4000);
    expect(env.MINIO_USE_SSL).toBe(true);
    expect(env.BOCHA_ENABLED).toBe(true);
    expect(env.REDIS_PORT).toBe(6380);
  });

  test("defaults Alipay integration to disabled", () => {
    const env = parseEnv({
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
    });

    expect(env.ALIPAY_ENABLED).toBe(false);
  });

  test("parses disabled Alipay integration flag", () => {
    const env = parseEnv({
      ALIPAY_ENABLED: "false",
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
    });

    expect(env.ALIPAY_ENABLED).toBe(false);
  });

  test("defaults email integration to disabled", () => {
    const env = parseEnv({
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
    });

    expect(env.EMAIL_ENABLED).toBe(false);
  });

  test("rejects enabled email integration without credentials", () => {
    expect(() =>
      parseEnv({
        EMAIL_ENABLED: "true",
        JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
      }),
    ).toThrow();
  });

  test("parses enabled email integration credentials", () => {
    const env = parseEnv({
      EMAIL_ENABLED: "true",
      EMAIL_FROM: "noreply@example.com",
      EMAIL_HOST: "smtp.example.com",
      EMAIL_PASSWORD: "smtp-password",
      EMAIL_USER: "smtp-user",
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
    });

    expect(env.EMAIL_ENABLED).toBe(true);
    expect(env.EMAIL_HOST).toBe("smtp.example.com");
  });

  test("rejects enabled Alipay integration without credentials", () => {
    expect(() =>
      parseEnv({
        ALIPAY_ENABLED: "true",
        JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
      }),
    ).toThrow();
  });

  test("parses enabled Alipay integration credentials", () => {
    const env = parseEnv({
      ALIPAY_APP_ID: "app-id",
      ALIPAY_ENABLED: "true",
      ALIPAY_GATEWAY: "https://openapi.alipay.com/gateway.do",
      ALIPAY_NOTIFY_URL: "https://api.example.com",
      ALIPAY_PRIVATE_KEY: "private-key",
      ALIPAY_PUBLIC_KEY: "public-key",
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
    });

    expect(env.ALIPAY_ENABLED).toBe(true);
    expect(env.ALIPAY_APP_ID).toBe("app-id");
    expect(env.ALIPAY_NOTIFY_URL).toBe("https://api.example.com");
  });

  test("parses supported AI providers", () => {
    const deepseekEnv = parseEnv({
      AI_PROVIDER: "deepseek",
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
    });
    const ollamaEnv = parseEnv({
      AI_PROVIDER: "ollama",
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
      OLLAMA_BASE_URL: "http://127.0.0.1:11434",
      OLLAMA_MODEL: "qwen3.5",
    });

    expect(deepseekEnv.AI_PROVIDER).toBe("deepseek");
    expect(ollamaEnv.AI_PROVIDER).toBe("ollama");
    expect(ollamaEnv.OLLAMA_MODEL).toBe("qwen3.5");
  });

  test("defaults Ollama models to Qwen chat and DeepSeek reasoning", () => {
    const env = parseEnv({
      AI_PROVIDER: "ollama",
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
    });

    expect(env.OLLAMA_MODEL).toBe("qwen3.5");
    expect(env.OLLAMA_REASONER_MODEL).toBe("deepseek-r1");
  });

  test("rejects unsupported AI providers", () => {
    const source: Record<string, string> = {
      AI_PROVIDER: "openai",
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
    };

    expect(() => parseEnv(source)).toThrow();
  });
});
