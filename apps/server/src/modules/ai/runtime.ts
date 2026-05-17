import { ChatDeepSeek } from "@langchain/deepseek";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { ChatOllama } from "@langchain/ollama";
import { createAgent } from "langchain";
import type { CreateAgentParams } from "langchain";
import { env, type Env } from "../../shared/config/env.js";

export interface ChatModelOptions {
  readonly deepThink?: boolean;
}

export interface AiAgentOptions extends ChatModelOptions {
  readonly systemPrompt: string;
  readonly checkpointer?: PostgresSaver;
  readonly tools?: AiAgentTools;
}

type AiRuntimeEnv = Pick<
  Env,
  | "AI_PROVIDER"
  | "DEEPSEEK_API_KEY"
  | "DEEPSEEK_API_MODEL"
  | "DEEPSEEK_REASONER_API_MODEL"
  | "OLLAMA_BASE_URL"
  | "OLLAMA_MODEL"
  | "OLLAMA_REASONER_MODEL"
>;

type AiAgentTools = NonNullable<CreateAgentParams["tools"]>;

export const createDeepSeekInstance = (config: AiRuntimeEnv = env) =>
  new ChatDeepSeek({
    apiKey: config.DEEPSEEK_API_KEY,
    model: config.DEEPSEEK_API_MODEL,
    temperature: 1.3,
    maxTokens: 4396,
    streaming: true,
  });

export const createDeepSeekReasoner = (config: AiRuntimeEnv = env) =>
  new ChatDeepSeek({
    apiKey: config.DEEPSEEK_API_KEY,
    model: config.DEEPSEEK_REASONER_API_MODEL,
    temperature: 1.3,
    maxTokens: 18000,
    streaming: true,
  });

export const selectOllamaModel = (config: AiRuntimeEnv, deepThink = false) =>
  deepThink && config.OLLAMA_REASONER_MODEL.length > 0
    ? config.OLLAMA_REASONER_MODEL
    : config.OLLAMA_MODEL;

export const createOllamaInstance = (
  config: AiRuntimeEnv = env,
  deepThink = false,
) =>
  new ChatOllama({
    baseUrl: config.OLLAMA_BASE_URL,
    model: selectOllamaModel(config, deepThink),
    temperature: 1.3,
  });

export const createChatModelForEnv = (
  config: AiRuntimeEnv,
  options: ChatModelOptions = {},
) => {
  const deepThink = options.deepThink === true;

  if (config.AI_PROVIDER === "ollama") {
    return createOllamaInstance(config, deepThink);
  }

  return deepThink
    ? createDeepSeekReasoner(config)
    : createDeepSeekInstance(config);
};

export const createChatModel = (options: ChatModelOptions = {}) =>
  createChatModelForEnv(env, options);

export const selectAgentModelId = (
  config: AiRuntimeEnv,
  options: ChatModelOptions = {},
) => {
  const deepThink = options.deepThink === true;

  if (config.AI_PROVIDER === "ollama") {
    return `ollama:${selectOllamaModel(config, deepThink)}`;
  }

  return `deepseek:${
    deepThink ? config.DEEPSEEK_REASONER_API_MODEL : config.DEEPSEEK_API_MODEL
  }`;
};

export const selectAgentModel = (options: ChatModelOptions = {}) =>
  selectAgentModelId(env, options);

export const createAiAgentForEnv = (
  config: AiRuntimeEnv,
  options: AiAgentOptions,
) => {
  const model = selectAgentModelId(config, {
    deepThink: options.deepThink === true,
  });

  if (config.AI_PROVIDER === "ollama") {
    process.env.OLLAMA_BASE_URL = config.OLLAMA_BASE_URL;
  }

  return createAgent({
    ...(options.checkpointer ? { checkpointer: options.checkpointer } : {}),
    ...(options.tools ? { tools: options.tools } : {}),
    model,
    systemPrompt: options.systemPrompt,
  });
};

export const createAiAgent = (options: AiAgentOptions) =>
  createAiAgentForEnv(env, options);

let checkpointer: PostgresSaver | null = null;

export const getCheckpoint = async () => {
  if (!checkpointer) {
    checkpointer = PostgresSaver.fromConnString(env.DATABASE_URL);
    await checkpointer.setup();
  }
  return checkpointer;
};
