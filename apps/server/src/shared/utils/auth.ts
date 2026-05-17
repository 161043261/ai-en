import { randomUUID } from "node:crypto";
import { sign, verify } from "hono/jwt";
import {
  signedTokenPayloadSchema,
  type SignedTokenPayload,
  type TokenPair,
  type TokenPayload,
} from "../auth/token.js";
import { env } from "../config/env.js";

export const generateToken = async (
  payload: TokenPayload,
): Promise<TokenPair> => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const accessToken = await sign(
    {
      ...payload,
      tokenType: "access",
      iat: issuedAt,
      jti: randomUUID(),
      exp: issuedAt + 60 * 60 * 24,
    }, // 1 day
    env.JWT_SECRET,
  );

  const refreshToken = await sign(
    {
      ...payload,
      tokenType: "refresh",
      iat: issuedAt,
      jti: randomUUID(),
      exp: issuedAt + 60 * 60 * 24 * 7,
    }, // 7 days
    env.JWT_SECRET,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const verifyToken = async (
  token: string,
): Promise<SignedTokenPayload> => {
  const payload = await verify(token, env.JWT_SECRET, "HS256");
  return signedTokenPayloadSchema.parse(payload);
};

export const verifyAccessToken = async (token: string) => {
  const payload = await verifyToken(token);
  if (payload.tokenType !== "access") {
    throw new Error("Expected access token");
  }
  return payload;
};

export const verifyRefreshToken = async (token: string) => {
  const payload = await verifyToken(token);
  if (payload.tokenType !== "refresh") {
    throw new Error("Expected refresh token");
  }
  return payload;
};
