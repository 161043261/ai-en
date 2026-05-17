import { z } from "zod";

const optionalNullableStringSchema = z.string().optional().or(z.null());
const optionalEmailSchema = z.email().optional().or(z.literal("")).or(z.null());

export const loginSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  password: z.string().min(1),
  email: z.email().optional().or(z.literal("")),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: optionalEmailSchema,
  address: optionalNullableStringSchema,
  avatar: optionalNullableStringSchema,
  bio: optionalNullableStringSchema,
  isTimingTask: z.boolean().optional(),
  timingTaskTime: optionalNullableStringSchema,
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
