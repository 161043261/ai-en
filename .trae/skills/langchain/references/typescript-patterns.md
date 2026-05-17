# LangChain TypeScript Patterns

Use these patterns when implementing LangChain.js, LangGraph.js, or LangSmith-related code in TypeScript projects.

## Package Selection

- `@langchain/core`: messages, prompts, runnables, output parsers, documents, and shared abstractions.
- `@langchain/openai`, `@langchain/anthropic`, or provider packages: chat model integrations.
- `@langchain/community`: community integrations such as loaders, vector stores, and retrievers.
- `@langchain/langgraph`: graph orchestration, state graphs, persistence, interrupts, and streaming.
- `langsmith`: tracing, datasets, examples, evaluation, and client APIs.

## Strict Types

Prefer schemas over parallel TypeScript declarations for data crossing trust boundaries.

```ts
import { z } from "zod";

export const QuestionSchema = z.object({
  question: z.string().min(1),
  userId: z.string().uuid(),
});

export type QuestionInput = z.infer<typeof QuestionSchema>;
```

Parse at the boundary, then pass typed values into chain or graph code.

```ts
export const parseQuestionInput = (source: unknown): QuestionInput =>
  QuestionSchema.parse(source);
```

## Chain Construction

Keep construction separate from invocation so tests can inject fake models.

```ts
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export const createAnswerChain = (model: BaseChatModel) => {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Answer using only the provided context."],
    ["human", "Context: {context}\nQuestion: {question}"],
  ]);

  return prompt.pipe(model);
};
```

## Tool Inputs

Define tool schemas with `zod` and keep side effects injectable.

```ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const createLookupTool = (lookup: (id: string) => Promise<string>) =>
  tool(async ({ id }) => lookup(id), {
    name: "lookup-record",
    description: "Look up one record by ID.",
    schema: z.object({ id: z.string().min(1) }),
  });
```

## LangGraph State

Represent graph state explicitly and keep node functions deterministic when possible.

```ts
import { Annotation, StateGraph } from "@langchain/langgraph";

const GraphState = Annotation.Root({
  question: Annotation<string>(),
  answer: Annotation<string | undefined>(),
});

const answerNode = async (state: typeof GraphState.State) => ({
  answer: `Received: ${state.question}`,
});

export const createGraph = () =>
  new StateGraph(GraphState).addNode("answer", answerNode);
```

## Testing Strategy

- Test prompt input mapping with pure functions.
- Test `zod` schemas with valid and invalid payloads.
- Test tools with fake dependencies.
- Test graph routing separately from model behavior.
- Use fake or stub models for unit tests; keep provider calls in integration tests.
- Assert streaming behavior with deterministic chunks when the user asks for stream support.

## LangSmith Safety

- Configure tracing with environment variables.
- Avoid logging secrets in tags, metadata, run names, examples, and dataset records.
- Prefer stable dataset examples for regression testing.
- Keep evaluator outputs structured so CI can compare pass rates over time.
