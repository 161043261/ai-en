import { Hono } from "hono";
import withPrisma from "../../shared/prisma/index.js";
import { success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const trackerRouter = new Hono<HonoContext>();

const uvSchema = z.object({
  anonymousId: z.string(),
  userId: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  device: z.string().optional(),
});

trackerRouter.post(
  "/uv",
  withPrisma,
  zValidator("json", uvSchema),
  async (c) => {
    const prisma = c.get("prisma");
    const body = c.req.valid("json");

    const visitor = await prisma.visitor.upsert({
      where: { anonymousId: body.anonymousId },
      create: {
        anonymousId: body.anonymousId,
        userId: body.userId,
        browser: body.browser,
        os: body.os,
        device: body.device,
      },
      update: {
        userId: body.userId,
        browser: body.browser,
        os: body.os,
        device: body.device,
      },
      select: {
        id: true,
      },
    });

    c.var.logger.info(
      { visitorId: visitor.id, anonymousId: body.anonymousId },
      "Tracked UV",
    );

    return c.json(success(visitor.id));
  },
);

const updateUvSchema = z.object({
  visitorId: z.string(),
  userId: z.string(),
});

trackerRouter.post(
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

const performanceSchema = z.object({
  visitorId: z.string(),
  fp: z.number().optional(),
  fcp: z.number().optional(),
  lcp: z.number().optional(),
  inp: z.number().optional(),
  cls: z.number().optional(),
});

trackerRouter.post(
  "/performance",
  withPrisma,
  zValidator("json", performanceSchema),
  async (c) => {
    const prisma = c.get("prisma");
    const body = c.req.valid("json");

    await prisma.performanceEntry.create({
      data: {
        visitorId: body.visitorId,
        fp: body.fp,
        fcp: body.fcp,
        lcp: body.lcp,
        inp: body.inp,
        cls: body.cls,
      },
    });

    c.var.logger.info({ visitorId: body.visitorId }, "Tracked performance");

    return c.json(success(true));
  },
);

const pvSchema = z.object({
  visitorId: z.string(),
  url: z.string(),
  referrer: z.string().optional(),
  path: z.string(),
});

trackerRouter.post(
  "/pv",
  withPrisma,
  zValidator("json", pvSchema),
  async (c) => {
    const prisma = c.get("prisma");
    const body = c.req.valid("json");

    await prisma.pageView.create({
      data: {
        visitorId: body.visitorId,
        url: body.url,
        referrer: body.referrer,
        path: body.path,
      },
    });

    c.var.logger.info(
      { visitorId: body.visitorId, url: body.url },
      "Tracked page view",
    );

    return c.json(success(true));
  },
);

const eventSchema = z.object({
  visitorId: z.string(),
  event: z.string(),
  payload: z.string().optional(), // Or whatever the payload type is
  url: z.string().optional(),
});

trackerRouter.post(
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
        payload: body.payload,
        url: body.url,
      },
    });

    c.var.logger.info(
      { visitorId: body.visitorId, event: body.event },
      "Tracked event",
    );

    return c.json(success(true));
  },
);

const errorSchema = z.object({
  visitorId: z.string(),
  error: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  url: z.string().optional(),
});

trackerRouter.post(
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
        stack: body.stack,
        url: body.url,
      },
    });

    c.var.logger.error(
      { visitorId: body.visitorId, error: body.error, message: body.message },
      "Tracked error",
    );

    return c.json(success(true));
  },
);

export default trackerRouter;
