import type { RefreshTokenPayload } from "@ai-en/common/types/user";
import { createMiddleware } from "hono/factory";
import { verifyToken } from "../utils/auth.js";
import { error } from "../utils/response.js";

import type { HonoContext } from "../../types/index.js";

export const authMiddleware = createMiddleware<HonoContext>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return c.json(error(null, "token not found", 401), 401);
  }

  try {
    const decoded = await verifyToken<RefreshTokenPayload>(token);
    if (decoded.tokenType !== "access") {
      return c.json(error(null, "token expired or not valid", 401), 401);
    }
    c.set("user", decoded);
    await next();
  } catch (err) {
    c.var.logger?.error(err, "Authentication failed");
    return c.json(error(null, "token expired or not valid", 401), 401);
  }
});
