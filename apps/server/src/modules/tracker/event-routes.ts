import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import withPrisma from "../../shared/prisma/index.js";
import { success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { errorSchema, eventSchema } from "./schema.js";
import { toPrismaJsonPayload } from "./service.js";

export const createEventTrackerRouter = () => {
  const router = new Hono<HonoContext>();

  router.post(
    "/event",
    withPrisma,
    zValidator("json", eventSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const body = c.req.valid("json");
      await prisma.trackEvent.create({
        data: {
          visitorId: body.visitorId,
          event: body.event,
          payload: toPrismaJsonPayload(body.payload),
          url: body.url ?? null,
        },
      });
      c.var.logger.info(
        { visitorId: body.visitorId, event: body.event },
        "Tracked event",
      );
      return c.json(success(true));
    },
  );

  router.post(
    "/error",
    withPrisma,
    zValidator("json", errorSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const body = c.req.valid("json");
      await prisma.errorEntry.create({
        data: {
          visitorId: body.visitorId,
          error: body.error,
          message: body.message,
          stack: body.stack ?? null,
          url: body.url ?? null,
        },
      });
      c.var.logger.error(
        { visitorId: body.visitorId, error: body.error, message: body.message },
        "Tracked error",
      );
      return c.json(success(true));
    },
  );

  return router;
};
