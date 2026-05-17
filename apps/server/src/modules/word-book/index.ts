import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Prisma } from "../../generated/prisma/client.js";
import withPrisma from "../../shared/prisma/index.js";
import { success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { wordQuerySchema } from "./schema.js";

const wordBookRouter = new Hono<HonoContext>();

wordBookRouter.get(
  "/",
  zValidator("query", wordQuerySchema),
  withPrisma,
  async (c) => {
    const query = c.req.valid("query");
    const { page, pageSize, word } = query;
    const prisma = c.get("prisma");

    const where: Prisma.WordBookWhereInput = {};
    if (word) where.word = { contains: word };
    if (query.gk !== undefined) where.gk = query.gk;
    if (query.zk !== undefined) where.zk = query.zk;
    if (query.gre !== undefined) where.gre = query.gre;
    if (query.toefl !== undefined) where.toefl = query.toefl;
    if (query.ielts !== undefined) where.ielts = query.ielts;
    if (query.cet6 !== undefined) where.cet6 = query.cet6;
    if (query.cet4 !== undefined) where.cet4 = query.cet4;
    if (query.ky !== undefined) where.ky = query.ky;

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
