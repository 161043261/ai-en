import { Hono } from "hono";
import { authMiddleware } from "../../shared/middleware/auth.js";
import withPrisma from "../../shared/prisma/index.js";
import { success, error } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const learnRouter = new Hono<HonoContext>();

learnRouter.get("/word/:id", authMiddleware, withPrisma, async (c) => {
  const prisma = c.get("prisma");
  const user = c.get("user");
  const id = c.req.param("id");

  // 1. Check if the user has purchased the course to access this page
  const courseRecord = await prisma.courseRecord.findFirst({
    where: {
      userId: user.userId,
      courseId: id,
      isPurchased: true,
    },
    include: {
      course: true,
    },
  });

  if (!courseRecord) {
    return c.json(error(null, "Invalid request or course not purchased", 403));
  }

  const courseType = courseRecord.course.value; // e.g., 'gk' or 'zk'

  // Get words based on the course type
  const words = await prisma.wordBook.findMany({
    where: {
      [courseType]: true,
      wordBookRecords: {
        none: {
          userId: user.userId,
        },
      },
    },
    skip: 0,
    take: 10,
    orderBy: {
      frq: "desc",
    },
  });

  c.var.logger.info(
    { userId: user.userId, courseId: id, count: words.length },
    "Fetched words for learning",
  );

  return c.json(success(words));
});

const saveWordMasterSchema = z.object({
  wordIds: z.array(z.string()),
});

learnRouter.post(
  "/word/master",
  authMiddleware,
  withPrisma,
  zValidator("json", saveWordMasterSchema),
  async (c) => {
    const prisma = c.get("prisma");
    const userPayload = c.get("user");
    const { wordIds } = c.req.valid("json");

    // 1. Save words to wordBookRecord
    const wordBookRecords = wordIds.map((wordId) => ({
      wordId,
      userId: userPayload.userId,
      isMaster: true,
    }));

    await prisma.wordBookRecord.createMany({
      data: wordBookRecords,
    });

    // 2. Update user's learned word count
    const user = await prisma.user.update({
      where: {
        id: userPayload.userId,
      },
      data: {
        wordNumber: {
          increment: wordIds.length,
        },
      },
    });

    c.var.logger.info(
      { userId: userPayload.userId, savedCount: wordIds.length },
      "Saved mastered words",
    );

    return c.json(
      success({
        wordNumber: user.wordNumber,
      }),
    );
  },
);

export default learnRouter;
