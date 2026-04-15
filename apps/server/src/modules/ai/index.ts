import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { success, error } from "../../shared/utils/response.js";
import { ChatDeepSeek } from "@langchain/deepseek";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { createAgent } from "langchain";
import type { AIMessageChunk } from "langchain";
import type { HonoContext } from "../../types/index.js";

const aiRouter = new Hono<HonoContext>();

export const chatMode = [
  {
    role: "normal",
    prompt: "你是一个女仆请根据用户的对话内容，给出相应的回答，请用中文回答",
    label: "💬 智能助手",
    id: "1",
  },
  {
    role: "master",
    prompt:
      "你是一个英语大师，这是一个英语学习的对话，根据用户的对话内容，给出相应的回答(使用专业术语)，请用英文回答",
    label: "🎓 英语大师",
    id: "2",
  },
  {
    role: "business",
    prompt:
      "你是一个商务英语专家，这是一个商务英语的对话，根据用户的对话内容，给出相应的回答(使用商务英语专业术语)，请用中文回答",
    label: "💼 商务英语",
    id: "3",
  },
  {
    role: "qilinge",
    prompt:
      "你是一个喜欢装逼，天马行空，说话不着边际的一个人，容易暴怒，请根据用户的对话内容，给出相应的回答(使用麒麟哥的语气)，需要一点发癫，发疯，并且你从不道歉，请用中文回答",
    label: "🐉 麒麟哥",
    id: "4",
  },
  {
    role: "xiaoman",
    prompt:
      "你是一个知名程序员，这是一个程序员学习的对话，根据用户的对话内容，给出相应的回答(使用程序员专业术语)，请用中文回答",
    label: "💻 小满模式",
    id: "5",
  },
] as const;

// 1. Initialize DeepSeek
export const createDeepSeekInstance = () => {
  return new ChatDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    model: process.env.DEEPSEEK_API_MODEL || "deepseek-chat",
    temperature: 1.3,
    maxTokens: 4396,
    streaming: true,
  });
};

const createDeepSeekReasoner = () => {
  return new ChatDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    model: process.env.DEEPSEEK_REASONER_API_MODEL || "deepseek-reasoner",
    temperature: 1.3,
    maxTokens: 18000,
    streaming: true,
  });
};

// 2. Initialize checkpoint
let checkpointer: PostgresSaver | null = null;
const getCheckpoint = async () => {
  if (!checkpointer) {
    checkpointer = PostgresSaver.fromConnString(process.env.DATABASE_URL || "");
    await checkpointer.setup();
  }
  return checkpointer;
};

// 3. Initialize Bocha Search
const createBochaSearch = async (query: string, count = 10) => {
  const result = await fetch(process.env.BOCHA_SEARCH_URL || "", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BOCHA_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      count,
      summary: true,
    }),
  });
  const { data } = await result.json();
  const values = data?.webPages?.value || [];
  const prompt = values
    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => `
       标题：${item.name}
       链接：${item.url}
       摘要：${item?.summary?.replace(/\n/g, "") ?? ""}
       网站名称：${item.siteName}
       网站logo：${item.siteIcon}
       发布时间：${item.dateLastCrawled}
    `,
    )
    .join("\n");
  return prompt;
};

// Prompt module
aiRouter.get("/prompt/list", (c) => {
  return c.json(
    success(
      chatMode.map((item) => ({
        id: item.id,
        label: item.label,
        role: item.role,
      })),
    ),
  );
});

// Chat module
const chatSchema = z.object({
  role: z.string(),
  content: z.string(),
  userId: z.string(),
  webSearch: z.boolean().optional(),
  deepThink: z.boolean().optional(),
});

aiRouter.post("/chat", zValidator("json", chatSchema), async (c) => {
  const body = c.req.valid("json");
  const promptObject = chatMode.find((item) => item.role === body.role);

  if (!promptObject) {
    return c.json(error(null, "模式不存在"), 400);
  }

  let prompt = promptObject.prompt;

  if (body.webSearch) {
    const webSearchPrompt = await createBochaSearch(body.content);
    prompt += `请根据以下搜索结果回答问题：${webSearchPrompt}(并且返回你参考的网站名称)，用户问题：${body.content}`;
  }

  let model = createDeepSeekInstance();
  if (body.deepThink) {
    model = createDeepSeekReasoner();
  }

  const cp = await getCheckpoint();

  // Note: createAgent in LangChain is typically from @langchain/langgraph
  // The old code used `import { createAgent } from 'langchain'` which might have been a custom wrapper or older API.
  // Assuming it acts as a LangGraph agent or simple executor. We'll use createAgent from langchain if it exists,
  // or we'll manually invoke the model if createAgent isn't directly matching.
  // But wait, createAgent might be `createReactAgent` from `@langchain/langgraph`.
  // Let's stick to the old code's import first.
  const agent = createAgent({
    model,
    systemPrompt: prompt,
    checkpointer: cp,
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
      const [msg] = chunk;
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
      const content = msg?.content ?? "";
      if (content) {
        await stream.writeSSE({
          data: JSON.stringify({ content: content, role: "ai", type: "chat" }),
        });
      }
    }
  });
});

aiRouter.get("/chat/history", async (c) => {
  const userId = c.req.query("userId");
  const role = c.req.query("role");

  if (!userId || !role) {
    return c.json(error(null, "userId and role are required"));
  }

  const cp = await getCheckpoint();
  const messages = await cp.get({
    configurable: { thread_id: `${userId}-${role}` },
  });

  const list = (messages?.channel_values?.messages ?? []) as AIMessageChunk[];
  if (!list) return c.json(success([]));

  c.var.logger.info(
    { userId, role, count: list.length },
    "Fetched AI chat history",
  );

  return c.json(
    success(
      list.map((item) => ({
        content: item.content,
        role: item.type, // Usually "ai" or "human"
        reasoning: item.additional_kwargs?.reasoning_content,
      })),
    ),
  );
});

export default aiRouter;
