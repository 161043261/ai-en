import { type Env, env } from "../shared/config/env.js";
import { checkOllamaModels } from "./ollama-readiness.js";
import {
  createDependencyStatus,
  type ReadinessCheck,
} from "./readiness-types.js";

type AiReadinessEnv = Pick<
  Env,
  | "AI_PROVIDER"
  | "BOCHA_API_KEY"
  | "BOCHA_ENABLED"
  | "BOCHA_SEARCH_URL"
  | "DEEPSEEK_API_KEY"
  | "OLLAMA_BASE_URL"
  | "OLLAMA_MODEL"
  | "OLLAMA_REASONER_MODEL"
>;

interface AiReadinessOptions {
  readonly fetchImpl?: typeof fetch;
}

const hasUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const createAiConfigCheck =
  (
    config: AiReadinessEnv = env,
    options: AiReadinessOptions = {},
  ): ReadinessCheck =>
  async () => {
    if (config.AI_PROVIDER === "deepseek" && config.DEEPSEEK_API_KEY === "") {
      return createDependencyStatus("ai", false, "missing DEEPSEEK_API_KEY");
    }

    if (
      config.BOCHA_ENABLED &&
      (config.BOCHA_API_KEY === "" || !hasUrl(config.BOCHA_SEARCH_URL))
    ) {
      return createDependencyStatus("ai", false, "invalid Bocha config");
    }

    if (config.AI_PROVIDER === "ollama") {
      if (config.OLLAMA_MODEL === "") {
        return createDependencyStatus("ai", false, "missing OLLAMA_MODEL");
      }

      const result = await checkOllamaModels({
        baseUrl: config.OLLAMA_BASE_URL,
        chatModel: config.OLLAMA_MODEL,
        ...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {}),
        reasonerModel: config.OLLAMA_REASONER_MODEL,
      });

      if (!result.ok) {
        return createDependencyStatus("ai", false, result.message);
      }
    }

    return createDependencyStatus(
      "ai",
      true,
      config.AI_PROVIDER === "ollama"
        ? "configured for ollama with local models"
        : "configured for deepseek",
    );
  };
