import type { RefreshTokenPayload } from "@ai-en/common/types/user";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import withPrisma from "../../shared/prisma/index.js";
import { generateToken, verifyToken } from "../../shared/utils/auth.js";
import { error, success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";

import { authMiddleware } from "../../shared/middleware/auth.js";
import { getBucket, minioClient } from "../../shared/utils/minio.js";

const userRouter = new Hono<HonoContext>();

const selectUser = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  // password: true,
  avatar: true,
  bio: true,
  isTimingTask: true,
  timingTaskTime: true,
  wordNumber: true,
  dayNumber: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
};

userRouter.post(
  "/login",
  zValidator(
    "json",
    z.object({
      phone: z.string(),
      password: z.string(),
    }),
  ),
  withPrisma,
  async (c) => {
    const { phone, password } = c.req.valid("json");
    const prisma = c.get("prisma");
    const user = await prisma.user.findUnique({
      where: { phone },
    });
    if (!user) {
      return c.json(error(null, "user not found", 404));
    }
    if (user.password !== password) {
      return c.json(error(null, "password error", 400));
    }
    const updateUser = await prisma.user.update({
      where: { phone },
      data: {
        lastLoginAt: new Date(),
      },
      select: selectUser,
    });

    const token = await generateToken({
      userId: updateUser.id,
      name: updateUser.name,
      email: updateUser.email,
    });

    c.var.logger.info({ userId: updateUser.id }, "User logged in successfully");

    return c.json(success({ ...updateUser, token }));
  },
);

userRouter.post(
  "/register",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      phone: z.string(),
      password: z.string(),
      email: z.email().optional().or(z.literal("")),
    }),
  ),
  withPrisma,
  async (c) => {
    const { name, phone, password, email } = c.req.valid("json");
    const prisma = c.get("prisma");
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return c.json(error(null, "phone already exists", 400));
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return c.json(error(null, "email already exists", 400));
      }
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        password,
        email: email || null,
        lastLoginAt: new Date(),
      },
      select: selectUser,
    });

    const token = await generateToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });

    c.var.logger.info({ userId: newUser.id }, "User registered successfully");

    return c.json(success({ ...newUser, token }));
  },
);

userRouter.post(
  "/refresh-token",
  zValidator(
    "json",
    z.object({
      refreshToken: z.string(),
    }),
  ),
  withPrisma,
  async (c) => {
    const { refreshToken } = c.req.valid("json");
    const prisma = c.get("prisma");
    try {
      const decoded = await verifyToken<RefreshTokenPayload>(refreshToken);
      if (decoded.tokenType !== "refresh") {
        return c.json(error(null, "token expired or invalid", 401));
      }
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) {
        return c.json(error(null, "user not found", 404));
      }
      const token = await generateToken({
        userId: user.id,
        name: user.name,
        email: user.email,
      });

      c.var.logger.info({ userId: user.id }, "Token refreshed successfully");

      return c.json(success(token));
    } catch {
      c.var.logger.error("Token expired or invalid during refresh");
      return c.json(error(null, "token expired or invalid", 401));
    }
  },
);

userRouter.post("/upload-avatar", async (c) => {
  const body = await c.req.parseBody();
  const file = typeof body.file === "string" ? null : body.file;
  if (!file) {
    return c.json(error(null, "file not found", 400));
  }
  if (file.size > 1024 * 1024 * 5) {
    return c.json(error(null, "file size cannot exceed 5MB", 400));
  }
  const bucket = getBucket();
  const fileName = `${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await minioClient.putObject(bucket, fileName, buffer, file.size, {
    "Content-Type": file.type,
  });

  const isHttps =
    process.env.MINIO_USE_SSL === "1" || process.env.MINIO_USE_SSL === "true";
  const baseUrl = isHttps ? "https" : "http";
  const port = process.env.MINIO_PORT || "9000";
  const databaseUrl = `/${bucket}/${fileName}`;
  const previewUrl = `${baseUrl}://${process.env.MINIO_ENDPOINT || "127.0.0.1"}:${port}${databaseUrl}`;

  c.var.logger.info({ fileName }, "Avatar uploaded successfully");

  return c.json(
    success({
      previewUrl,
      databaseUrl,
    }),
  );
});

userRouter.post(
  "/update-user",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      name: z.string().optional(),
      email: z.email().optional().or(z.literal("")).or(z.null()),
      address: z.string().optional().or(z.null()),
      avatar: z.string().optional().or(z.null()),
      bio: z.string().optional().or(z.null()),
      isTimingTask: z.boolean().optional(),
      timingTaskTime: z.string().optional().or(z.null()),
    }),
  ),
  withPrisma,
  async (c) => {
    const data = c.req.valid("json");
    const user = c.get("user");
    const prisma = c.get("prisma");

    const updatedUser = await prisma.user.update({
      where: {
        id: user.userId,
      },
      data: {
        name: data.name,
        email: data.email,
        address: data.address,
        avatar: data.avatar,
        bio: data.bio,
        isTimingTask: data.isTimingTask,
        timingTaskTime: data.timingTaskTime || "",
      },
      select: selectUser,
    });

    c.var.logger.info({ userId: user.userId }, "User updated successfully");

    return c.json(success(updatedUser));
  },
);

export default userRouter;
