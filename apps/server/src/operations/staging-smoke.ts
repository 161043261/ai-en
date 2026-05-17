import { z } from "zod";
import { aiProviderSchema } from "../shared/config/env.js";
import {
  createRequiredStagingEnvKeys,
  type StagingAiProvider,
} from "./staging-env-keys.js";
import {
  type ManualSmokeCheck,
  manualChecks,
} from "./staging-manual-checks.js";

const booleanStagingEnvSchema = z
  .union([
    z.literal("1"),
    z.literal("0"),
    z.literal("true"),
    z.literal("false"),
  ])
  .default("0")
  .transform((value) => value === "1" || value === "true");

const stagingSmokeEnvSchema = z.object({
  AI_PROVIDER: aiProviderSchema.default("deepseek"),
  ALIPAY_ENABLED: booleanStagingEnvSchema,
  EMAIL_ENABLED: booleanStagingEnvSchema,
  STAGING_BASE_URL: z.url(),
  STAGING_SMOKE_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
});

export type StagingSmokeStatus = "passed" | "failed";
export type AutomatedCheckName = "health" | "readiness";

export interface StagingSmokeConfig {
  readonly aiProvider: StagingAiProvider;
  readonly alipayEnabled: boolean;
  readonly baseUrl: string;
  readonly emailEnabled: boolean;
  readonly timeoutMs: number;
}

export interface AutomatedSmokeCheck {
  readonly name: AutomatedCheckName;
  readonly ok: boolean;
  readonly message: string;
}

export interface StagingSmokeReport {
  readonly status: StagingSmokeStatus;
  readonly automatedChecks: readonly AutomatedSmokeCheck[];
  readonly manualChecks: readonly ManualSmokeCheck[];
  readonly requiredEnvKeys: readonly string[];
}

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export const parseStagingSmokeEnv = (source: unknown): StagingSmokeConfig => {
  const parsed = stagingSmokeEnvSchema.parse(source);
  return {
    aiProvider: parsed.AI_PROVIDER,
    alipayEnabled: parsed.ALIPAY_ENABLED,
    baseUrl: parsed.STAGING_BASE_URL,
    emailEnabled: parsed.EMAIL_ENABLED,
    timeoutMs: parsed.STAGING_SMOKE_TIMEOUT_MS,
  };
};

const joinUrl = (baseUrl: string, path: string) =>
  `${baseUrl.replace(/\/$/, "")}${path}`;

const runHttpCheck = async (
  name: AutomatedCheckName,
  path: string,
  fetchImpl: FetchLike,
  timeoutMs: number,
): Promise<AutomatedSmokeCheck> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(path, { signal: controller.signal });
    const ok = response.status === 200;
    return {
      name,
      ok,
      message: ok ? "ok" : `expected 200, got ${response.status}`,
    };
  } catch (error: unknown) {
    return {
      name,
      ok: false,
      message: error instanceof Error ? error.message : "request failed",
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const createStagingSmokeReport = async ({
  aiProvider = "deepseek",
  alipayEnabled = false,
  baseUrl,
  emailEnabled = false,
  timeoutMs = 5000,
  fetchImpl = fetch,
}: {
  readonly aiProvider?: StagingAiProvider;
  readonly alipayEnabled?: boolean;
  readonly baseUrl: string;
  readonly emailEnabled?: boolean;
  readonly timeoutMs?: number;
  readonly fetchImpl?: FetchLike;
}): Promise<StagingSmokeReport> => {
  const automatedChecks = await Promise.all([
    runHttpCheck("health", joinUrl(baseUrl, "/health"), fetchImpl, timeoutMs),
    runHttpCheck("readiness", joinUrl(baseUrl, "/ready"), fetchImpl, timeoutMs),
  ]);

  return {
    status: automatedChecks.every((check) => check.ok) ? "passed" : "failed",
    automatedChecks,
    manualChecks,
    requiredEnvKeys: createRequiredStagingEnvKeys(aiProvider, {
      alipayEnabled,
      emailEnabled,
    }),
  };
};

export { createRequiredStagingEnvKeys } from "./staging-env-keys.js";
