import { z } from "zod";

export const TokenSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const UserLoginSchema = z.object({
  password: z.string().min(1),
  phone: z.string().min(1),
});

export const UserRegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(1),
  phone: z.string().min(1),
});

export const UserUpdateSchema = z.object({
  address: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  isTimingTask: z.boolean(),
  name: z.string().min(1),
  timingTaskTime: z.string(),
});

export const AvatarResultSchema = z.object({
  databaseUrl: z.string(),
  previewUrl: z.string(),
});

export const UserProfileSchema = z.object({
  address: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  createdAt: z.string(),
  dayNumber: z.number(),
  email: z.string().nullable().optional(),
  id: z.string(),
  isTimingTask: z.boolean(),
  lastLoginAt: z.string().nullable().optional(),
  name: z.string(),
  phone: z.string(),
  timingTaskTime: z.string(),
  updatedAt: z.string(),
  wordNumber: z.number(),
});

export const WebUserSchema = UserProfileSchema.extend({
  token: TokenSchema,
});

export type Token = z.infer<typeof TokenSchema>;
export type AvatarResult = z.infer<typeof AvatarResultSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type WebUser = z.infer<typeof WebUserSchema>;
