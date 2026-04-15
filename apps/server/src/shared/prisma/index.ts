import { PrismaPg } from "@prisma/adapter-pg";
import type { Context, Next } from "hono";
import { PrismaClient } from "../../generated/prisma/client.js";
import "dotenv/config";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://root:pass@127.0.0.1:5432/ai_en";

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

function withPrisma(c: Context, next: Next) {
  if (!c.get("prisma")) {
    c.set("prisma", prisma);
  }
  return next();
}

export default withPrisma;
