import { Hono } from "hono";
import { authMiddleware } from "../../shared/middleware/auth.js";
import withPrisma from "../../shared/prisma/index.js";
import { success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { formatCourse, purchasedCourseWhere } from "./service.js";

const courseRouter = new Hono<HonoContext>();

courseRouter.get("/list", withPrisma, async (c) => {
  const prisma = c.get("prisma");
  const courses = await prisma.course.findMany();
  const list = courses.map(formatCourse);
  c.var.logger.info({ count: list.length }, "Fetched course list");
  return c.json(success(list));
});

courseRouter.get("/my", authMiddleware, withPrisma, async (c) => {
  const prisma = c.get("prisma");
  const user = c.get("user");
  const courseRecords = await prisma.courseRecord.findMany({
    where: purchasedCourseWhere(user.userId),
    include: {
      course: true,
    },
  });
  const list = courseRecords.map((item) => formatCourse(item.course));
  c.var.logger.info(
    { userId: user.userId, count: list.length },
    "Fetched user courses",
  );
  return c.json(success(list));
});

export default courseRouter;
