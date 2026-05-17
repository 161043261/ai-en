import { z } from "zod";

const PhoneSchema = z
  .string()
  .regex(/^1[3-9]\d{9}$/, "Enter a valid mainland China phone number.");

export const LoginFormSchema = z.object({
  password: z.string().min(1, "Enter your password."),
  phone: PhoneSchema,
});

export const RegisterFormSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(32, "Name must be 32 characters or fewer."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(64, "Password must be 64 characters or fewer."),
  phone: PhoneSchema,
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type RegisterFormData = z.infer<typeof RegisterFormSchema>;
