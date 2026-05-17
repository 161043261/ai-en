import cron from "node-cron";
import { tool } from "langchain";
import { z } from "zod";
import { createAiAgent } from "./runtime.js";
import { pino } from "pino";
import { prisma } from "../../shared/prisma/index.js";
import { env } from "../../shared/config/env.js";
import { createEmailTransport } from "../../shared/email/sender.js";
import {
  createDigestQueue,
  createDigestWorker,
  digestJobOptions,
  digestTaskName,
} from "./digest-queue.js";
import {
  enqueueDigestEmail,
  findEligibleDigestUsers,
  isEmailDigestJobData,
  processEmailDigestJob,
} from "./digest-service.js";

const logger = pino();
const digestQueue = createDigestQueue();
const emailTransport = createEmailTransport();

const queryTool = tool(
  async ({ userId }) => {
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
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(24, 0, 0, 0)),
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
    description: "Query a user's word learning records by user id.",
    schema: z.object({ userId: z.string().min(1) }),
  },
);

const createDigestMarkdown = async (userId: string) => {
  const agent = createAiAgent({
    tools: [queryTool],
    systemPrompt:
      "Create a concise daily word-memory report from the user's learning data.",
  });

  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: `Create today's word learning report for user id ${userId}. Exclude sensitive information.`,
      },
    ],
  });

  const content: unknown = result.messages?.at(-1)?.content;
  return typeof content === "string" ? content : null;
};

const handleDailyDigest = async () => {
  if (!env.EMAIL_ENABLED) {
    logger.info("Email digest scan skipped because email is disabled");
    return;
  }

  const users = await findEligibleDigestUsers(prisma);

  for (const user of users) {
    const markdown = await createDigestMarkdown(user.id);
    if (!markdown) {
      logger.warn({ userId: user.id }, "Digest generation returned no content");
      continue;
    }

    await enqueueDigestEmail(digestQueue, user, markdown);
    logger.info({ userId: user.id, email: user.email }, "Queued digest email");
  }
};

export const initCronJobs = () => {
  createDigestWorker(async (name, data) => {
    if (name === digestTaskName.emailDigest && isEmailDigestJobData(data)) {
      if (!env.EMAIL_ENABLED) {
        logger.info({ userId: data.userId }, "Email digest skipped");
        return;
      }

      const sent = await processEmailDigestJob(emailTransport, data);
      if (!sent) {
        throw new Error("Digest email delivery failed");
      }
      logger.info({ userId: data.userId, email: data.email }, "Sent digest");
      return;
    }

    if (name === digestTaskName.everyDayDigest) {
      await handleDailyDigest();
    }
  });

  cron.schedule("0 0 * * *", () => {
    logger.info("Queueing daily digest scan job");
    void digestQueue.add(
      digestTaskName.everyDayDigest,
      { requestedAt: new Date().toISOString() },
      digestJobOptions(
        0,
        `daily-digest:${new Date().toISOString().slice(0, 10)}`,
      ),
    );
  });
};
