import type { Context, Next } from "hono";
import { prisma } from "./client.js";

function withPrisma(c: Context, next: Next) {
  if (!c.get("prisma")) {
    c.set("prisma", prisma);
  }
  return next();
}

export default withPrisma;
export { connectPrisma, disconnectPrisma, prisma } from "./client.js";
