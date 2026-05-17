import type { PrismaClient } from "../generated/prisma/client.js";
import type { SignedTokenPayload } from "../shared/auth/token.js";

export interface HonoContext {
  Variables: {
    prisma: PrismaClient;
    user: SignedTokenPayload;
    logger: import("pino").Logger;
    requestId: string;
  };
}
