import { createMiddleware } from "hono/factory";
import type { HonoContext } from "../../types/index.js";
import { verifyAccessToken } from "../utils/auth.js";
import { error } from "../utils/response.js";

export const authMiddleware = createMiddleware<HonoContext>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return c.json(error(null, "token not found", 401), 401);
  }

  try {
    const decoded = await verifyAccessToken(token);
    c.set("user", decoded);
    await next();
  } catch (err) {
    c.var.logger?.error(err, "Authentication failed");
    return c.json(error(null, "token expired or not valid", 401), 401);
  }
});
