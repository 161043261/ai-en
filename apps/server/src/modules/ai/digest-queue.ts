import { Queue, Worker, type JobsOptions } from "bullmq";
import type { Redis } from "ioredis";
import { createRedisConnection } from "../../shared/redis/connection.js";

export const digestQueueName = "DIGEST_QUEUE";

export const digestTaskName = {
  emailDigest: "EMAIL_DIGEST_TASK",
  everyDayDigest: "EVERY_DAY_DIGEST_TASK",
} as const;

export interface EmailDigestJobData {
  readonly userId: string;
  readonly email: string;
  readonly text: string;
}

export interface EveryDayDigestJobData {
  readonly requestedAt: string;
}

export type DigestJobData = EmailDigestJobData | EveryDayDigestJobData;

export const createDigestQueue = (
  connection: Redis = createRedisConnection(),
) => new Queue<DigestJobData>(digestQueueName, { connection });

export const createDigestWorker = (
  processor: (name: string, data: DigestJobData) => Promise<void>,
  connection: Redis = createRedisConnection(),
) =>
  new Worker<DigestJobData>(
    digestQueueName,
    (job) => processor(job.name, job.data),
    { connection },
  );

export const digestJobOptions = (
  delay: number,
  jobId: string,
): JobsOptions => ({
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 30_000,
  },
  delay,
  jobId,
  removeOnComplete: true,
  removeOnFail: 100,
});
