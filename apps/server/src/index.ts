import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { pinoLogger } from "hono-pino";
import "dotenv/config";
import aiRouter from "./modules/ai/index.js";
import userRouter from "./modules/user/index.js";
import wordBookRouter from "./modules/word-book/index.js";
import courseRouter from "./modules/course/index.js";
import learnRouter from "./modules/learn/index.js";
import payRouter from "./modules/pay/index.js";
import trackerRouter from "./modules/tracker/index.js";
import type { HonoContext } from "./types/index.js";
import { initCronJobs } from "./modules/ai/cron.js";

import { initMinio } from "./shared/utils/minio.js";

const app = new Hono<HonoContext>();

// Initialize minio
initMinio().catch((err) => {
  console.error("Failed to initialize Minio:", err);
});

// Initialize Cron Jobs
initCronJobs();

app.use(
  "*",
  pinoLogger({
    pino: {
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    },
  }),
);
app.use("*", cors());

// mount routers
app.route("/api/v1/user", userRouter);
app.route("/api/v1/word-book", wordBookRouter);
app.route("/api/v1/ai", aiRouter);
app.route("/api/v1/course", courseRouter);
app.route("/api/v1/learn", learnRouter);
app.route("/api/v1/pay", payRouter);
app.route("/api/v1/tracker", trackerRouter);

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
