import { randomUUID } from "node:crypto";
import { createMiddleware } from "hono/factory";

const requestIdHeader = "x-request-id";

export const requestIdMiddleware = createMiddleware(async (c, next) => {
  const requestId = c.req.header(requestIdHeader) ?? randomUUID();
  c.set("requestId", requestId);
  c.header(requestIdHeader, requestId);
  await next();
});
