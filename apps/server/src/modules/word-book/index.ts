import { zValidator } from "@hono/zod-validator";
import type { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../../shared/middleware/auth.js";
import withPrisma from "../../shared/prisma/index.js";
import { success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";

const wordBookRouter = new Hono<HonoContext>();

const booleanQuery = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((val) => {
    if (val === true || val === "true") return true;
    if (val === false || val === "false") return false;
    return undefined;
  })
  .optional();

const wordQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : 1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : 12)),
  word: z.string().optional(),
  gk: booleanQuery,
  zk: booleanQuery,
  gre: booleanQuery,
  toefl: booleanQuery,
  ielts: booleanQuery,
  cet6: booleanQuery,
  cet4: booleanQuery,
  ky: booleanQuery,
});

wordBookRouter.use("*", authMiddleware);

wordBookRouter.get(
  "/",
  zValidator("query", wordQuerySchema),
  withPrisma,
  async (c) => {
    const query = c.req.valid("query");
    const { page, pageSize, word, ...rest } = query;
    const prisma = c.get("prisma");

    const where: Prisma.WordBookWhereInput = {
      word: word ? { contains: word } : undefined,
      ...rest,
    };

    const [total, list] = await Promise.all([
      prisma.wordBook.count({ where }),
      prisma.wordBook.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: {
          frq: "desc",
        },
      }),
    ]);

    c.var.logger.info({ count: list.length, total }, "Fetched word-book list");

    return c.json(
      success({
        total,
        list,
      }),
    );
  },
);

export default wordBookRouter;
