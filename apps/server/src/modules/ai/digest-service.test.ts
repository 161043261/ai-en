import dayjs from "dayjs";
import { describe, expect, test } from "vitest";
import {
  buildDigestJobId,
  calculateDigestDelay,
  enqueueDigestEmail,
  isEmailDigestJobData,
  type DigestQueuePort,
} from "./digest-service.js";
import { digestTaskName } from "./digest-queue.js";

describe("digest service", () => {
  test("calculates non-negative digest delivery delay", () => {
    const now = dayjs("2026-01-01T09:00:00");

    expect(calculateDigestDelay("10:30:00", now)).toBe(5_400_000);
    expect(calculateDigestDelay("08:30:00", now)).toBe(0);
  });

  test("enqueues an idempotent email digest job", async () => {
    const calls: unknown[] = [];
    const queue: DigestQueuePort = {
      add: async (name, data, options) => {
        calls.push({ name, data, options });
        return {};
      },
    };
    const now = dayjs("2026-01-01T09:00:00");

    await enqueueDigestEmail(
      queue,
      {
        id: "user-1",
        email: "user@example.com",
        timingTaskTime: "10:00:00",
      },
      "# Daily Report",
      now,
    );

    expect(calls).toEqual([
      {
        name: digestTaskName.emailDigest,
        data: {
          userId: "user-1",
          email: "user@example.com",
          text: "<h1>Daily Report</h1>\n",
        },
        options: expect.objectContaining({
          delay: 3_600_000,
          jobId: "digest:2026-01-01:user-1",
          attempts: 3,
        }),
      },
    ]);
  });

  test("recognizes email digest job data", () => {
    expect(
      isEmailDigestJobData({
        userId: "user-1",
        email: "user@example.com",
        text: "html",
      }),
    ).toBe(true);
    expect(isEmailDigestJobData({ requestedAt: "2026-01-01" })).toBe(false);
    expect(buildDigestJobId("user-1", dayjs("2026-01-01"))).toBe(
      "digest:2026-01-01:user-1",
    );
  });
});
