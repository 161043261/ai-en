import { Hono } from "hono";
import { cors } from "hono/cors";
import { pinoLogger } from "hono-pino";
import aiRouter from "./modules/ai/index.js";
import courseRouter from "./modules/course/index.js";
import learnRouter from "./modules/learn/index.js";
import payRouter from "./modules/pay/index.js";
import trackerRouter from "./modules/tracker/index.js";
import userRouter from "./modules/user/index.js";
import wordBookRouter from "./modules/word-book/index.js";
import {
  createReadinessReport,
  defaultReadinessChecks,
  type ReadinessCheck,
} from "./operations/readiness.js";
import { env } from "./shared/config/env.js";
import { requestIdMiddleware } from "./shared/middleware/request-id.js";
import { error, success } from "./shared/utils/response.js";
import type { HonoContext } from "./types/index.js";

interface AppOptions {
  readonly readinessChecks?: readonly ReadinessCheck[];
}

export const createApp = (options: AppOptions = {}) => {
  const app = new Hono<HonoContext>();
  const readinessChecks = options.readinessChecks ?? defaultReadinessChecks();
  const pino =
    env.NODE_ENV === "test"
      ? { level: env.LOG_LEVEL }
      : {
          level: env.LOG_LEVEL,
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
            },
          },
        };

  app.use("*", requestIdMiddleware);
  app.use("*", pinoLogger({ pino }));
  app.use("*", cors());

  app.get("/api/v1/health", (c) => c.json(success({ status: "ok" })));
  app.get("/api/v1/ready", async (c) => {
    const report = await createReadinessReport(readinessChecks);
    const status = report.status === "ready" ? 200 : 503;
    return c.json(
      report.status === "ready"
        ? success(report)
        : error(report, "dependencies unavailable", status),
      status,
    );
  });

  app.route("/api/v1/user", userRouter);
  app.route("/api/v1/word-book", wordBookRouter);
  app.route("/api/v1/ai", aiRouter);
  app.route("/ai/v1", aiRouter);
  app.route("/api/v1/course", courseRouter);
  app.route("/api/v1/learn", learnRouter);
  app.route("/api/v1/pay", payRouter);
  app.route("/api/v1/tracker", trackerRouter);

  app.notFound((c) => c.json(error(null, "not found", 404), 404));
  app.onError((err, c) => {
    c.var.logger?.error(err, "Unhandled server error");
    return c.json(error(null, "internal server error", 500), 500);
  });

  return app;
};

export type AppType = ReturnType<typeof createApp>;
