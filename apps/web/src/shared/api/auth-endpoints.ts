import type { ApiClient } from "../http";
import { createResponseSchema } from "./response-schema";
import type { Token } from "./user-schema";
import { TokenSchema } from "./user-schema";

export type AuthEndpoints = {
  readonly refreshToken: (refreshToken: string) => Promise<Token>;
};

export function createAuthEndpoints(client: ApiClient): AuthEndpoints {
  return {
    refreshToken: async (refreshToken) => {
      const response = await client.post(
        "/user/refresh-token",
        createResponseSchema(TokenSchema),
        { body: { refreshToken } },
      );

      return response.data;
    },
  };
}
