import { z } from "zod";

export const tokenPayloadSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string().nullable().optional(),
});

export const signedTokenPayloadSchema = tokenPayloadSchema.extend({
  tokenType: z.enum(["access", "refresh"]),
  exp: z.number().optional(),
  iat: z.number().optional(),
  jti: z.string().optional(),
});

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
export type SignedTokenPayload = z.infer<typeof signedTokenPayloadSchema>;
export type TokenPair = z.infer<typeof tokenPairSchema>;
