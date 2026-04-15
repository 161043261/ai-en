import cron from "node-cron";
import dayjs from "dayjs";
import { createAgent } from "langchain";
import { tool } from "@langchain/core/tools";
import { marked } from "marked";
import { PrismaClient } from "../../generated/prisma/client.js";
import { createDeepSeekInstance } from "./index.js"; // wait, need to export it
import { pino } from "pino";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://root:pass@127.0.0.1:5432/ai_en";

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

const logger = pino();

const queryTool = tool(
  async ({ userId }: { userId: string }) => {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        email: true,
        name: true,
        wordNumber: true,
        wordBookRecords: {
          where: {
            createdAt: {
              gte: dayjs().startOf("day").toDate(),
              lte: dayjs().add(1, "day").startOf("day").toDate(),
            },
          },
          select: {
            word: {
              select: {
                word: true,
              },
            },
          },
        },
      },
    });
    return user;
  },
  {
    name: "queryTool",
    description: "根据用户id查询用户学习的单词记录",
    schema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "用户id" },
      },
      required: ["userId"],
    },
  },
);

export const initCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    logger.info("Running daily AI email digest cron job");
    try {
      const userIds = await prisma.user.findMany({
        where: {
          isTimingTask: true,
          timingTaskTime: { not: "" },
          email: { not: null },
          wordBookRecords: {
            some: {
              createdAt: {
                gte: dayjs().startOf("day").toDate(),
                lte: dayjs().add(1, "day").startOf("day").toDate(),
              },
            },
          },
        },
        select: {
          id: true,
          timingTaskTime: true,
          email: true,
        },
      });

      for (const user of userIds) {
        const agent = createAgent({
          model: createDeepSeekInstance(),
          tools: [queryTool],
          systemPrompt:
            "你是一个单词记忆助手，根据用户信息和单词记录，生成单词记忆报告",
        });

        const result = await agent.invoke({
          messages: [
            {
              role: "user",
              content: `查询用户信息,并且根据用户id关联单词记录表，查询出用户今天的单词记录,用户id: ${user.id}，过滤掉敏感信息`,
            },
          ],
        });

        const content = result.messages?.at(-1)?.content;
        if (content && typeof content === "string" && user.timingTaskTime) {
          const html = await marked.parse(content);
          const [hour, minute, second] = user.timingTaskTime
            .split(":")
            .map(Number);
          const target = dayjs()
            .startOf("day")
            .set("hour", hour)
            .set("minute", minute)
            .set("second", second);

          let delay = target.diff(dayjs());
          if (delay < 0) {
            delay = 0;
          }

          // In a real app we'd queue this with delay, but since we just migrated to simple cron:
          setTimeout(() => {
            // Here you would send the email. The old app just queued it.
            // We simulate the queue processor here.
            logger.info(
              { userId: user.id, email: user.email, length: html.length },
              "Sending digest email",
            );
            // emailService.send(user.email, html)
          }, delay);
        }
      }
    } catch (e) {
      logger.error(e, "Error in daily digest cron job");
    }
  });
};
