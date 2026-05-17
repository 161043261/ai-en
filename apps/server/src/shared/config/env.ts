import "dotenv/config";
import { z } from "zod";

const booleanEnvSchema = z
  .union([
    z.literal("1"),
    z.literal("0"),
    z.literal("true"),
    z.literal("false"),
  ])
  .default("0")
  .transform((value) => value === "1" || value === "true");

export const aiProviderSchema = z.enum(["deepseek", "ollama"]);

const requiredAlipayCredentialMessage =
  "Alipay credentials are required when ALIPAY_ENABLED=true";
const requiredEmailCredentialMessage =
  "Email credentials are required when EMAIL_ENABLED=true";

const envSchema = z
  .object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z.string().default("info"),
    DATABASE_URL: z
      .string()
      .min(1)
      .default("postgresql://root:pass@127.0.0.1:5432/ai_en"),
    JWT_SECRET: z.string().min(16).default("012345abcdefghijklmnopqrstuvwxyz"),
    MINIO_ACCESS_KEY: z.string().min(1).default("admin"),
    MINIO_SECRET_KEY: z.string().min(1).default("12345678"),
    MINIO_ENDPOINT: z.string().min(1).default("127.0.0.1"),
    MINIO_PORT: z.coerce.number().int().positive().default(9000),
    MINIO_USE_SSL: booleanEnvSchema,
    MINIO_BUCKET: z.string().min(1).default("bucket"),
    AI_PROVIDER: aiProviderSchema.default("deepseek"),
    DEEPSEEK_API_KEY: z.string().default(""),
    DEEPSEEK_API_MODEL: z.string().default("deepseek-chat"),
    DEEPSEEK_REASONER_API_MODEL: z.string().default("deepseek-reasoner"),
    OLLAMA_BASE_URL: z.url().default("http://127.0.0.1:11434"),
    OLLAMA_MODEL: z.string().min(1).default("qwen3.5"),
    OLLAMA_REASONER_MODEL: z.string().default("deepseek-r1"),
    BOCHA_ENABLED: booleanEnvSchema,
    BOCHA_SEARCH_URL: z.string().default(""),
    BOCHA_API_KEY: z.string().default(""),
    REDIS_HOST: z.string().default("127.0.0.1"),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    REDIS_PASSWORD: z.string().default(""),
    EMAIL_ENABLED: booleanEnvSchema,
    EMAIL_HOST: z.string().default(""),
    EMAIL_PORT: z.coerce.number().int().positive().default(465),
    EMAIL_USE_SSL: booleanEnvSchema,
    EMAIL_USER: z.string().default(""),
    EMAIL_PASSWORD: z.string().default(""),
    EMAIL_FROM: z.string().default(""),
    ALIPAY_ENABLED: booleanEnvSchema,
    ALIPAY_APP_ID: z.string().default(""),
    ALIPAY_PRIVATE_KEY: z.string().default(""),
    ALIPAY_PUBLIC_KEY: z.string().default(""),
    ALIPAY_GATEWAY: z.url().default("https://openapi.alipay.com/gateway.do"),
    ALIPAY_NOTIFY_URL: z.url().default("http://localhost:3000"),
    PAYMENT_NOTIFY_SECRET: z.string().default(""),
  })
  .superRefine((value, ctx) => {
    if (value.EMAIL_ENABLED && value.EMAIL_HOST.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: requiredEmailCredentialMessage,
        path: ["EMAIL_HOST"],
      });
    }

    if (value.EMAIL_ENABLED && value.EMAIL_USER.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: requiredEmailCredentialMessage,
        path: ["EMAIL_USER"],
      });
    }

    if (value.EMAIL_ENABLED && value.EMAIL_PASSWORD.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: requiredEmailCredentialMessage,
        path: ["EMAIL_PASSWORD"],
      });
    }

    if (value.EMAIL_ENABLED && value.EMAIL_FROM.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: requiredEmailCredentialMessage,
        path: ["EMAIL_FROM"],
      });
    }

    if (!value.ALIPAY_ENABLED) {
      return;
    }

    if (value.ALIPAY_APP_ID.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: requiredAlipayCredentialMessage,
        path: ["ALIPAY_APP_ID"],
      });
    }

    if (value.ALIPAY_PRIVATE_KEY.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: requiredAlipayCredentialMessage,
        path: ["ALIPAY_PRIVATE_KEY"],
      });
    }

    if (value.ALIPAY_PUBLIC_KEY.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: requiredAlipayCredentialMessage,
        path: ["ALIPAY_PUBLIC_KEY"],
      });
    }
  });

export const parseEnv = (source: z.input<typeof envSchema>) =>
  envSchema.parse(source);

export const env = parseEnv(process.env);
export type Env = z.infer<typeof envSchema>;
