import type { ApiClient } from "../http";
import { createResponseSchema } from "./response-schema";
import {
  AvatarResultSchema,
  type AvatarResult,
  UserLoginSchema,
  UserProfileSchema,
  UserRegisterSchema,
  UserUpdateSchema,
  WebUserSchema,
  type UserLogin,
  type UserProfile,
  type UserRegister,
  type UserUpdate,
  type WebUser,
} from "./user-schema";

export type UserEndpoints = {
  readonly login: (data: UserLogin) => Promise<WebUser>;
  readonly register: (data: UserRegister) => Promise<WebUser>;
  readonly updateUser: (data: UserUpdate) => Promise<UserProfile>;
  readonly uploadAvatar: (file: FormData) => Promise<AvatarResult>;
};

export function createUserEndpoints(client: ApiClient): UserEndpoints {
  return {
    login: async (data) => {
      const response = await client.post(
        "/user/login",
        createResponseSchema(WebUserSchema),
        {
          body: UserLoginSchema.parse(data),
        },
      );
      return response.data;
    },
    register: async (data) => {
      const response = await client.post(
        "/user/register",
        createResponseSchema(WebUserSchema),
        {
          body: UserRegisterSchema.parse(data),
        },
      );
      return response.data;
    },
    updateUser: async (data) => {
      const body = UserUpdateSchema.parse(data);
      const response = await client.post(
        "/user/update-user",
        createResponseSchema(UserProfileSchema),
        {
          body,
        },
      );
      return response.data;
    },
    uploadAvatar: async (file) => {
      const response = await client.post(
        "/user/upload-avatar",
        createResponseSchema(AvatarResultSchema),
        {
          body: file,
        },
      );
      return response.data;
    },
  };
}
