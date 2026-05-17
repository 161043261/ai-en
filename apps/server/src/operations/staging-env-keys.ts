import type { z } from "zod";
import type { aiProviderSchema } from "../shared/config/env.js";

export type StagingAiProvider = z.infer<typeof aiProviderSchema>;

export interface StagingDependencyFlags {
  readonly alipayEnabled?: boolean;
  readonly emailEnabled?: boolean;
}

const commonRequiredStagingEnvKeys = [
  "DATABASE_URL",
  "REDIS_HOST",
  "MINIO_ENDPOINT",
  "MINIO_BUCKET",
] as const;

const emailRequiredStagingEnvKeys = [
  "EMAIL_HOST",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "EMAIL_FROM",
] as const;

const alipayRequiredStagingEnvKeys = [
  "ALIPAY_APP_ID",
  "ALIPAY_PRIVATE_KEY",
  "ALIPAY_PUBLIC_KEY",
  "ALIPAY_GATEWAY",
  "ALIPAY_NOTIFY_URL",
] as const;

const providerRequiredStagingEnvKeys = {
  deepseek: ["DEEPSEEK_API_KEY"] as const,
  ollama: ["OLLAMA_BASE_URL", "OLLAMA_MODEL"] as const,
};

export const createRequiredStagingEnvKeys = (
  aiProvider: StagingAiProvider,
  flags: StagingDependencyFlags = {},
) => [
  ...commonRequiredStagingEnvKeys,
  ...(flags.emailEnabled ? emailRequiredStagingEnvKeys : []),
  ...(flags.alipayEnabled
    ? alipayRequiredStagingEnvKeys
    : ["PAYMENT_NOTIFY_SECRET"]),
  ...providerRequiredStagingEnvKeys[aiProvider],
];
