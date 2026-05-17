import { Prisma } from "../../generated/prisma/client.js";
import type { eventPayloadSchema } from "./schema.js";
import type { z } from "zod";

type EventPayload = z.infer<typeof eventPayloadSchema>;

export const toPrismaJsonPayload = (payload: EventPayload | undefined) =>
  payload === undefined || payload === null ? Prisma.JsonNull : payload;
