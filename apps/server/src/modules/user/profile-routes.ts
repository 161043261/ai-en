import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Prisma } from "../../generated/prisma/client.js";
import { env } from "../../shared/config/env.js";
import { authMiddleware } from "../../shared/middleware/auth.js";
import withPrisma from "../../shared/prisma/index.js";
import { getBucket, minioClient } from "../../shared/utils/minio.js";
import { error, success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { updateUserSchema } from "./schema.js";
import { selectUser } from "./select-user.js";

const createUserUpdateInput = (
  data: ReturnType<typeof updateUserSchema.parse>,
): Prisma.UserUpdateInput => {
  const updateData: Prisma.UserUpdateInput = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.isTimingTask !== undefined)
    updateData.isTimingTask = data.isTimingTask;
  if (data.timingTaskTime !== undefined) {
    updateData.timingTaskTime = data.timingTaskTime || "";
  }
  return updateData;
};

export const createUserProfileRouter = () => {
  const router = new Hono<HonoContext>();

  router.post("/upload-avatar", authMiddleware, async (c) => {
    const body = await c.req.parseBody();
    const file = body.file;
    if (!(file instanceof File))
      return c.json(error(null, "file not found", 400));
    if (file.size > 1024 * 1024 * 5) {
      return c.json(error(null, "file size cannot exceed 5MB", 400));
    }

    const bucket = getBucket();
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await minioClient.putObject(bucket, fileName, buffer, file.size, {
      "Content-Type": file.type,
    });

    const baseUrl = env.MINIO_USE_SSL ? "https" : "http";
    const databaseUrl = `/${bucket}/${fileName}`;
    const previewUrl = `${baseUrl}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}${databaseUrl}`;
    c.var.logger.info({ fileName }, "Avatar uploaded successfully");
    return c.json(success({ previewUrl, databaseUrl }));
  });

  router.post(
    "/update-user",
    authMiddleware,
    zValidator("json", updateUserSchema),
    withPrisma,
    async (c) => {
      const data = c.req.valid("json");
      const user = c.get("user");
      const prisma = c.get("prisma");
      const updatedUser = await prisma.user.update({
        where: { id: user.userId },
        data: createUserUpdateInput(data),
        select: selectUser,
      });

      c.var.logger.info({ userId: user.userId }, "User updated successfully");
      return c.json(success(updatedUser));
    },
  );

  return router;
};
