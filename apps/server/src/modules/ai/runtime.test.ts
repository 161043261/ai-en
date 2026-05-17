import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatOllama } from "@langchain/ollama";
import { describe, expect, test } from "vitest";
import { parseEnv } from "../../shared/config/env.js";
import {
  createChatModelForEnv,
  createOllamaInstance,
  selectAgentModelId,
  selectOllamaModel,
} from "./runtime.js";

const createRuntimeEnv = (provider: "deepseek" | "ollama") =>
  parseEnv({
    AI_PROVIDER: provider,
    JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
    DEEPSEEK_API_KEY: "deepseek-key",
    DEEPSEEK_API_MODEL: "deepseek-chat",
    DEEPSEEK_REASONER_API_MODEL: "deepseek-reasoner",
    OLLAMA_BASE_URL: "http://127.0.0.1:11434",
    OLLAMA_MODEL: "qwen3.5",
    OLLAMA_REASONER_MODEL: "deepseek-r1",
  });

describe("AI runtime provider selection", () => {
  test("creates DeepSeek chat and reasoner models", () => {
    const env = createRuntimeEnv("deepseek");
    const chatModel = createChatModelForEnv(env);
    const reasonerModel = createChatModelForEnv(env, { deepThink: true });

    expect(chatModel).toBeInstanceOf(ChatDeepSeek);
    expect(reasonerModel).toBeInstanceOf(ChatDeepSeek);
    expect(chatModel.model).toBe("deepseek-chat");
    expect(reasonerModel.model).toBe("deepseek-reasoner");
  });

  test("creates Ollama chat model from local provider config", () => {
    const env = createRuntimeEnv("ollama");
    const model = createChatModelForEnv(env);
    const ollamaModel = createOllamaInstance(env);

    expect(model).toBeInstanceOf(ChatOllama);
    expect(model.model).toBe("qwen3.5");
    expect(ollamaModel.baseUrl).toBe("http://127.0.0.1:11434");
  });

  test("uses Ollama reasoner model only when configured", () => {
    const env = createRuntimeEnv("ollama");
    const fallbackEnv = parseEnv({
      AI_PROVIDER: "ollama",
      JWT_SECRET: "012345abcdefghijklmnopqrstuvwxyz",
      OLLAMA_MODEL: "qwen3.5",
      OLLAMA_REASONER_MODEL: "",
    });

    expect(selectOllamaModel(env, true)).toBe("deepseek-r1");
    expect(selectOllamaModel(fallbackEnv, true)).toBe("qwen3.5");
  });

  test("selects LangChain agent model identifiers", () => {
    const deepseekEnv = createRuntimeEnv("deepseek");
    const ollamaEnv = createRuntimeEnv("ollama");

    expect(selectAgentModelId(deepseekEnv)).toBe("deepseek:deepseek-chat");
    expect(selectAgentModelId(deepseekEnv, { deepThink: true })).toBe(
      "deepseek:deepseek-reasoner",
    );
    expect(selectAgentModelId(ollamaEnv)).toBe("ollama:qwen3.5");
    expect(selectAgentModelId(ollamaEnv, { deepThink: true })).toBe(
      "ollama:deepseek-r1",
    );
  });
});
