import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import withPrisma from "../../shared/prisma/index.js";
import { success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import {
  performanceSchema,
  pvSchema,
  updateUvSchema,
  uvSchema,
} from "./schema.js";

export const createVisitorTrackerRouter = () => {
  const router = new Hono<HonoContext>();

  router.post("/uv", withPrisma, zValidator("json", uvSchema), async (c) => {
    const prisma = c.get("prisma");
    const body = c.req.valid("json");
    const visitor = await prisma.visitor.upsert({
      where: { anonymousId: body.anonymousId },
      create: {
        anonymousId: body.anonymousId,
        ...(body.userId ? { user: { connect: { id: body.userId } } } : {}),
        browser: body.browser ?? null,
        os: body.os ?? null,
        device: body.device ?? null,
      },
      update: {
        ...(body.userId ? { user: { connect: { id: body.userId } } } : {}),
        browser: body.browser ?? null,
        os: body.os ?? null,
        device: body.device ?? null,
      },
      select: { id: true },
    });

    c.var.logger.info(
      { visitorId: visitor.id, anonymousId: body.anonymousId },
      "Tracked UV",
    );
    return c.json(success(visitor.id));
  });

  router.post(
    "/update-uv",
    withPrisma,
    zValidator("json", updateUvSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const body = c.req.valid("json");
      await prisma.visitor.update({
        where: { id: body.visitorId },
        data: { userId: body.userId },
      });
      c.var.logger.info(
        { visitorId: body.visitorId, userId: body.userId },
        "Updated UV",
      );
      return c.json(success(true));
    },
  );

  router.post("/pv", withPrisma, zValidator("json", pvSchema), async (c) => {
    const prisma = c.get("prisma");
    const body = c.req.valid("json");
    await prisma.pageView.create({
      data: {
        visitorId: body.visitorId,
        url: body.url,
        referrer: body.referrer ?? null,
        path: body.path,
      },
    });
    c.var.logger.info(
      { visitorId: body.visitorId, url: body.url },
      "Tracked page view",
    );
    return c.json(success(true));
  });

  router.post(
    "/performance",
    withPrisma,
    zValidator("json", performanceSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const body = c.req.valid("json");
      await prisma.performanceEntry.create({
        data: {
          visitorId: body.visitorId,
          fp: body.fp ?? null,
          fcp: body.fcp ?? null,
          lcp: body.lcp ?? null,
          inp: body.inp ?? null,
          cls: body.cls ?? null,
        },
      });
      c.var.logger.info({ visitorId: body.visitorId }, "Tracked performance");
      return c.json(success(true));
    },
  );

  return router;
};
