import type { TokenPayload, Token } from "@ai-en/common/types/user";
import { sign, verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "012345abcdefghijklmnopqrstuvwxyz";

export const generateToken = async (payload: TokenPayload): Promise<Token> => {
  const accessToken = await sign(
    {
      ...payload,
      tokenType: "access",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    }, // 1 day
    JWT_SECRET,
  );

  const refreshToken = await sign(
    {
      ...payload,
      tokenType: "refresh",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }, // 7 days
    JWT_SECRET,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const verifyToken = async <T = unknown>(token: string): Promise<T> => {
  return (await verify(token, JWT_SECRET, "HS256")) as T;
};
