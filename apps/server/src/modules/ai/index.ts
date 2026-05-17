import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { env } from "../../shared/config/env.js";
import { error, success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { createBochaSearch, shouldUseBochaSearch } from "./bocha-search.js";
import { parseAgentStreamChunk, toHistoryItem } from "./message.js";
import { getPromptByRole, listPromptMetadata } from "./prompts.js";
import { createAiAgent, getCheckpoint } from "./runtime.js";
import { chatHistoryQuerySchema, chatSchema } from "./schema.js";

const aiRouter = new Hono<HonoContext>();

aiRouter.get("/prompt/list", (c) => {
  return c.json(success(listPromptMetadata()));
});

aiRouter.post("/chat", zValidator("json", chatSchema), async (c) => {
  const body = c.req.valid("json");
  const promptObject = getPromptByRole(body.role);

  if (!promptObject) {
    return c.json(error(null, "chat mode not found"), 400);
  }

  let prompt = promptObject.prompt;

  if (shouldUseBochaSearch(env, body.webSearch)) {
    const webSearchPrompt = await createBochaSearch(body.content);
    prompt += `Answer using these search results: ${webSearchPrompt}. Include referenced site names. User question: ${body.content}`;
  }

  const cp = await getCheckpoint();

  const agent = createAiAgent({
    systemPrompt: prompt,
    checkpointer: cp,
    deepThink: body.deepThink === true,
  });

  const id = `${body.userId}-${body.role}`;

  const agentStream = await agent.stream(
    {
      messages: [{ role: "human", content: body.content }],
    },
    {
      configurable: { thread_id: id },
      streamMode: "messages",
    },
  );

  c.var.logger.info(
    {
      userId: body.userId,
      role: body.role,
      deepThink: body.deepThink,
      webSearch: body.webSearch,
    },
    "Started AI chat stream",
  );

  return streamSSE(c, async (stream) => {
    for await (const chunk of agentStream) {
      const msg = parseAgentStreamChunk(chunk);
      if (!msg) {
        continue;
      }
      const thinkMsg = msg?.additional_kwargs?.reasoning_content ?? "";
      if (thinkMsg) {
        await stream.writeSSE({
          data: JSON.stringify({
            content: thinkMsg,
            role: "ai",
            type: "reasoning",
          }),
        });
      }
      const content = typeof msg.content === "string" ? msg.content : "";
      if (content) {
        await stream.writeSSE({
          data: JSON.stringify({ content: content, role: "ai", type: "chat" }),
        });
      }
    }
  });
});

aiRouter.get("/chat/history", async (c) => {
  const parsedQuery = chatHistoryQuerySchema.safeParse({
    userId: c.req.query("userId"),
    role: c.req.query("role"),
  });

  if (!parsedQuery.success) {
    return c.json(error(null, "userId and role are required", 400), 400);
  }
  const { userId, role } = parsedQuery.data;

  const cp = await getCheckpoint();
  const messages = await cp.get({
    configurable: { thread_id: `${userId}-${role}` },
  });

  const rawList: unknown = messages?.channel_values?.messages;
  const list = Array.isArray(rawList) ? rawList : [];

  c.var.logger.info(
    { userId, role, count: list.length },
    "Fetched AI chat history",
  );

  return c.json(
    success(list.map(toHistoryItem).filter((item) => item !== null)),
  );
});

export default aiRouter;
