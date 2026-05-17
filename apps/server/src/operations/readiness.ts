import type { PrismaClient } from "../generated/prisma/client.js";
import { prisma } from "../shared/prisma/index.js";
import { createRedisConnection } from "../shared/redis/connection.js";
import { getBucket, minioClient } from "../shared/utils/minio.js";
import { createAiConfigCheck } from "./ai-readiness.js";
import { createPaymentConfigCheck } from "./payment-readiness.js";
import {
  createDependencyStatus,
  type ReadinessCheck,
  type ReadinessReport,
} from "./readiness-types.js";

export const createPostgresCheck =
  (client: PrismaClient): ReadinessCheck =>
  async () => {
    try {
      await client.$queryRaw`SELECT 1`;
      return createDependencyStatus("postgres", true, "connected");
    } catch {
      return createDependencyStatus("postgres", false, "unavailable");
    }
  };

export const createRedisCheck = (): ReadinessCheck => async () => {
  const connection = createRedisConnection();
  try {
    await connection.ping();
    return createDependencyStatus("redis", true, "connected");
  } catch {
    return createDependencyStatus("redis", false, "unavailable");
  } finally {
    connection.disconnect();
  }
};

export const createMinioCheck = (): ReadinessCheck => async () => {
  try {
    await minioClient.bucketExists(getBucket());
    return createDependencyStatus("minio", true, "bucket reachable");
  } catch {
    return createDependencyStatus("minio", false, "unavailable");
  }
};

export const defaultReadinessChecks = (): readonly ReadinessCheck[] => [
  createPostgresCheck(prisma),
  createRedisCheck(),
  createMinioCheck(),
  createAiConfigCheck(),
  createPaymentConfigCheck(),
];

export const createReadinessReport = async (
  checks: readonly ReadinessCheck[],
): Promise<ReadinessReport> => {
  const dependencies = await Promise.all(checks.map((check) => check()));
  const ready = dependencies.every((dependency) => dependency.ok);

  return {
    status: ready ? "ready" : "not_ready",
    dependencies,
  };
};

export type { ReadinessCheck, ReadinessReport };
export {
  createAiConfigCheck,
  createDependencyStatus,
  createPaymentConfigCheck,
};
