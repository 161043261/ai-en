import type { z } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import type { eventPayloadSchema } from "./schema.js";

type EventPayload = z.infer<typeof eventPayloadSchema>;

export const toPrismaJsonPayload = (payload: EventPayload | undefined) =>
  payload === undefined || payload === null ? Prisma.JsonNull : payload;
