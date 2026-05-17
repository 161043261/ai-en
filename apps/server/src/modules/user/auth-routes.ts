import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Prisma } from "../../generated/prisma/client.js";
import { hashPassword, verifyPassword } from "../../shared/auth/password.js";
import withPrisma from "../../shared/prisma/index.js";
import { generateToken, verifyRefreshToken } from "../../shared/utils/auth.js";
import { error, success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { loginSchema, refreshTokenSchema, registerSchema } from "./schema.js";
import { selectUser } from "./select-user.js";

export const createUserAuthRouter = () => {
  const router = new Hono<HonoContext>();

  router.post(
    "/login",
    zValidator("json", loginSchema),
    withPrisma,
    async (c) => {
      const { phone, password } = c.req.valid("json");
      const prisma = c.get("prisma");
      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) return c.json(error(null, "user not found", 404));

      const passwordResult = await verifyPassword(password, user.password);
      if (!passwordResult.valid)
        return c.json(error(null, "password error", 400));

      const updateData: Prisma.UserUpdateInput = { lastLoginAt: new Date() };
      if (passwordResult.needsRehash) {
        updateData.password = await hashPassword(password);
      }

      const updateUser = await prisma.user.update({
        where: { phone },
        data: updateData,
        select: selectUser,
      });
      const token = await generateToken({
        userId: updateUser.id,
        name: updateUser.name,
        email: updateUser.email,
      });

      c.var.logger.info(
        { userId: updateUser.id },
        "User logged in successfully",
      );
      return c.json(success({ ...updateUser, token }));
    },
  );

  router.post(
    "/register",
    zValidator("json", registerSchema),
    withPrisma,
    async (c) => {
      const { name, phone, password, email } = c.req.valid("json");
      const prisma = c.get("prisma");
      if (await prisma.user.findUnique({ where: { phone } })) {
        return c.json(error(null, "phone already exists", 400));
      }
      if (email && (await prisma.user.findUnique({ where: { email } }))) {
        return c.json(error(null, "email already exists", 400));
      }

      const newUser = await prisma.user.create({
        data: {
          name,
          phone,
          password: await hashPassword(password),
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

  router.post(
    "/refresh-token",
    zValidator("json", refreshTokenSchema),
    withPrisma,
    async (c) => {
      const { refreshToken } = c.req.valid("json");
      const prisma = c.get("prisma");
      try {
        const decoded = await verifyRefreshToken(refreshToken);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });
        if (!user)
          return c.json(error(null, "token expired or invalid", 401), 401);

        const token = await generateToken({
          userId: user.id,
          name: user.name,
          email: user.email,
        });
        c.var.logger.info({ userId: user.id }, "Token refreshed successfully");
        return c.json(success(token));
      } catch {
        c.var.logger.error("Token expired or invalid during refresh");
        return c.json(error(null, "token expired or invalid", 401), 401);
      }
    },
  );

  return router;
};
