import dayjs, { type Dayjs } from "dayjs";
import { marked } from "marked";
import type { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import type { EmailTransport } from "../../shared/email/sender.js";
import { sendEmail } from "../../shared/email/sender.js";
import {
  type DigestJobData,
  digestJobOptions,
  digestTaskName,
  type EmailDigestJobData,
} from "./digest-queue.js";

interface DigestUser {
  readonly id: string;
  readonly email: string | null;
  readonly timingTaskTime: string | null;
}

export interface DigestQueuePort {
  add(
    name: string,
    data: DigestJobData,
    options: ReturnType<typeof digestJobOptions>,
  ): Promise<unknown>;
}

export const buildEligibleDigestUserWhere = (
  now: Dayjs = dayjs(),
): Prisma.UserWhereInput => ({
  isTimingTask: true,
  timingTaskTime: { not: "" },
  email: { not: null },
  wordBookRecords: {
    some: {
      createdAt: {
        gte: now.startOf("day").toDate(),
        lte: now.add(1, "day").startOf("day").toDate(),
      },
    },
  },
});

export const calculateDigestDelay = (
  timingTaskTime: string,
  now: Dayjs = dayjs(),
) => {
  const [hour = 0, minute = 0, second = 0] = timingTaskTime
    .split(":")
    .map(Number);
  const target = now
    .startOf("day")
    .set("hour", hour)
    .set("minute", minute)
    .set("second", second);
  return Math.max(target.diff(now), 0);
};

export const buildDigestJobId = (userId: string, now: Dayjs = dayjs()) =>
  `digest:${now.format("YYYY-MM-DD")}:${userId}`;

export const enqueueDigestEmail = async (
  queue: DigestQueuePort,
  user: DigestUser,
  markdown: string,
  now: Dayjs = dayjs(),
) => {
  if (!user.email || !user.timingTaskTime) {
    return false;
  }

  const text = await marked.parse(markdown);
  await queue.add(
    digestTaskName.emailDigest,
    {
      userId: user.id,
      email: user.email,
      text,
    },
    digestJobOptions(
      calculateDigestDelay(user.timingTaskTime, now),
      buildDigestJobId(user.id, now),
    ),
  );
  return true;
};

export const findEligibleDigestUsers = (prisma: PrismaClient) =>
  prisma.user.findMany({
    where: buildEligibleDigestUserWhere(),
    select: {
      id: true,
      timingTaskTime: true,
      email: true,
    },
  });

export const processEmailDigestJob = (
  transport: EmailTransport,
  data: EmailDigestJobData,
) =>
  sendEmail(transport, {
    to: data.email,
    subject: "Daily Word Memory Report",
    html: data.text,
  });

export const isEmailDigestJobData = (
  data: DigestJobData,
): data is EmailDigestJobData =>
  "userId" in data && "email" in data && "text" in data;
