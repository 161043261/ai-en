import { z } from "zod";

export const AuthModeSchema = z.enum(["login", "register"]);

export type AuthMode = z.infer<typeof AuthModeSchema>;
