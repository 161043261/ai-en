import { serve } from "@hono/node-server";
import "dotenv/config";
import { createApp } from "./app.js";
import { initCronJobs } from "./modules/ai/cron.js";
import { env } from "./shared/config/env.js";
import { disconnectPrisma } from "./shared/prisma/index.js";
import { initMinio } from "./shared/utils/minio.js";

const app = createApp();

initMinio().catch((err) => {
  console.error("Failed to initialize Minio:", err);
});

initCronJobs();

const port = env.PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

const shutdown = async () => {
  await disconnectPrisma();
  process.exit(0);
};

process.once("SIGINT", () => {
  void shutdown();
});

process.once("SIGTERM", () => {
  void shutdown();
});
