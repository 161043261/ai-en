---
name: langchain
description: Build, modify, review, test, and debug LangChain.js, LangGraph.js, and LangSmith TypeScript applications. Use this skill whenever the user mentions LangChain, LangChain TypeScript, LangChain.js, LangGraph TypeScript, LangGraph.js, LangSmith tracing/evals, LCEL chains, chat models, tools, retrievers, vector stores, agents, structured output, streaming, memory, checkpointers, Runnable interfaces, or migration of LLM code to LangChain in a TypeScript/Node.js project.
---

# LangChain TypeScript

Use this skill to produce production-ready LangChain TypeScript code with strict typing, runtime validation, testability, and current LangChain ecosystem patterns.

## First Steps

1. Identify whether the task is about LangChain core, LangGraph, LangSmith, deployment, tracing, evals, or documentation lookup.
2. Inspect the local project before editing: package manager, installed `@langchain/*` packages, TypeScript settings, test framework, and runtime target.
3. Read `llms.txt` when the user asks for current docs, API details, LangSmith endpoints, LangGraph platform behavior, or doc links.
4. Read `references/typescript-patterns.md` before writing or reviewing TypeScript implementation patterns.
5. Prefer focused changes that preserve existing architecture and keep examples runnable in the user's repository.

## Implementation Principles

- Use TypeScript strict mode patterns. Do not introduce `any`, non-null assertions, or type assertions to silence errors.
- Validate external inputs with `zod`, then derive types with `z.infer<typeof Schema>`.
- Keep model/provider configuration at the boundary. Do not hard-code API keys, model names, project names, or LangSmith secrets.
- Use LangChain message classes and runnable interfaces consistently instead of passing loosely typed objects through the chain.
- Keep chain construction separate from invocation so tests can inject fake models, retrievers, tools, or checkpointers.
- Prefer small pure helpers for prompt formatting, output parsing, and document mapping.
- Add focused tests for parsing, branching, tool routing, retriever behavior, graph state transitions, and error boundaries.

## Common Workflows

### Chat Model Or Chain

- Verify the installed package for the provider, such as `@langchain/openai`, `@langchain/anthropic`, or `@langchain/deepseek`.
- Build prompts with `ChatPromptTemplate` when message roles matter.
- Return a typed result instead of leaking provider-specific response objects across the application.
- For structured output, define a `zod` schema and bind it through the model's structured-output support when available.

### Tools And Agents

- Define every tool input with a `zod` schema.
- Keep tool side effects explicit and injectable, especially database, filesystem, HTTP, email, or queue access.
- Treat tool outputs as untrusted if they cross an external boundary; validate or normalize them before feeding them back into the model.
- Add tests for tool schema rejection and the happy path.

### Retrieval

- Separate document loading, chunking, embedding, vector-store writes, and query-time retrieval.
- Preserve source metadata and normalize document IDs so answers can cite where context came from.
- Test retriever adapters with fake documents before wiring real vector stores.
- Avoid loading large documents in request handlers; use ingestion jobs or startup-safe workflows.

### LangGraph

- Model state with precise TypeScript types and reducers where state is accumulated.
- Keep nodes small: each node should read typed state and return a partial state update.
- Make routing functions deterministic and exhaustively tested.
- Inject checkpointers and stores so local tests do not require production persistence.

### LangSmith

- Use LangSmith for tracing, datasets, evals, and regression analysis when the user asks for observability or quality measurement.
- Keep tracing configuration environment-driven: `LANGSMITH_TRACING`, `LANGSMITH_API_KEY`, `LANGSMITH_PROJECT`, and related variables.
- Do not send secrets, raw credentials, or unnecessary personal data into trace metadata.

## Documentation Lookup

Use `llms.txt` as the local index of LangChain documentation. Search it before web browsing when the user asks for:

- LangSmith Agent Server API endpoints.
- LangGraph platform, deployment, streaming, threads, runs, checkpointers, stores, or SDK behavior.
- Fleet, managed agents, auth, OAuth, or tool integration docs.
- LangSmith tracing, datasets, evaluation, annotation, monitoring, or prompt management.

If the relevant docs entry is found in `llms.txt`, follow the linked official page. If it is not present or appears stale, use web search for the official LangChain docs.

## Output Style

- For code changes, provide the files changed, tests run, and any follow-up risks.
- For reviews, list concrete findings first, ordered by severity, with file references.
- For architecture guidance, give a concise design, then minimal TypeScript snippets that match the user's stack.
- For documentation answers, cite the official docs links from `llms.txt` when possible.

## Verification Checklist

- TypeScript compiles without suppressions.
- Runtime input is validated with `zod`.
- Provider credentials are read from configuration, not hard-coded.
- Tests cover deterministic logic and external-boundary failure modes.
- Streaming, retries, cancellation, and persistence are addressed when relevant.
- LangSmith tracing or evals are configured only when requested or already present.
