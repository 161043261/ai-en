import { z } from "zod";

const ollamaTagSchema = z.object({
  models: z.array(
    z.object({
      name: z.string(),
    }),
  ),
});

export interface OllamaModelCheckConfig {
  readonly baseUrl: string;
  readonly chatModel: string;
  readonly reasonerModel: string;
  readonly fetchImpl?: typeof fetch;
}

export interface OllamaModelCheckResult {
  readonly ok: boolean;
  readonly message: string;
}

export const listRequiredOllamaModels = (
  chatModel: string,
  reasonerModel: string,
) =>
  reasonerModel.length > 0 && reasonerModel !== chatModel
    ? [chatModel, reasonerModel]
    : [chatModel];

const isModelAvailable = (availableName: string, requiredName: string) =>
  availableName === requiredName ||
  availableName.startsWith(`${requiredName}:`);

const createTagsUrl = (baseUrl: string) =>
  `${baseUrl.replace(/\/$/, "")}/api/tags`;

export const checkOllamaModels = async ({
  baseUrl,
  chatModel,
  reasonerModel,
  fetchImpl = fetch,
}: OllamaModelCheckConfig): Promise<OllamaModelCheckResult> => {
  try {
    const response = await fetchImpl(createTagsUrl(baseUrl));

    if (!response.ok) {
      return {
        ok: false,
        message: `ollama unavailable: ${response.status}`,
      };
    }

    const payload = ollamaTagSchema.parse(await response.json());
    const availableModels = payload.models.map((model) => model.name);
    const missingModels = listRequiredOllamaModels(
      chatModel,
      reasonerModel,
    ).filter(
      (requiredModel) =>
        !availableModels.some((availableModel) =>
          isModelAvailable(availableModel, requiredModel),
        ),
    );

    if (missingModels.length > 0) {
      return {
        ok: false,
        message: `missing Ollama models: ${missingModels.join(", ")}`,
      };
    }

    return {
      ok: true,
      message: "ollama models available",
    };
  } catch (error: unknown) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "ollama unavailable",
    };
  }
};
