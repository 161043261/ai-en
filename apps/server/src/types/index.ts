import type { PrismaClient } from "../generated/prisma/client.js";
import type { RefreshTokenPayload } from "@ai-en/common/types/user";

export interface HonoContext {
  Variables: {
    prisma: PrismaClient;
    user: RefreshTokenPayload;
    logger: import("pino").Logger;
  };
}
