import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { authMiddleware } from "../../shared/middleware/auth.js";
import withPrisma from "../../shared/prisma/index.js";
import { error, success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { saveWordMasterSchema } from "./schema.js";
import { saveMasteredWords } from "./service.js";
import { findLearningWords } from "./word-selection.js";

const learnRouter = new Hono<HonoContext>();

learnRouter.get("/word/:id", authMiddleware, withPrisma, async (c) => {
  const prisma = c.get("prisma");
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await findLearningWords(prisma, user.userId, id);
  if (!result.allowed) {
    return c.json(error(null, "Invalid request or course not purchased", 403));
  }

  c.var.logger.info(
    { userId: user.userId, courseId: id, count: result.words.length },
    "Fetched words for learning",
  );

  return c.json(success(result.words));
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
    const result = await saveMasteredWords(prisma, userPayload.userId, wordIds);

    c.var.logger.info(
      { userId: userPayload.userId, savedCount: result.savedCount },
      "Saved mastered words",
    );

    return c.json(
      success({
        wordNumber: result.wordNumber,
      }),
    );
  },
);

export default learnRouter;
