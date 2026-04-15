import { mainApi, type Response } from '..'
import type {
  AvatarResult,
  UserLogin,
  UserRegister,
  UserUpdate,
  WebResultUser,
} from '@ai-en/common/types/user'

export const loginApi = (data: UserLogin) =>
  mainApi.post<Response<WebResultUser>>('/user/login', data)

export const registerApi = (data: UserRegister) =>
  mainApi.post<Response<WebResultUser>>('/user/register', data)

export const uploadAvatarApi = (file: FormData) =>
  mainApi.post<Response<AvatarResult>>('/user/upload-avatar', file)

export const updateUserApi = (data: UserUpdate) =>
  mainApi.post<Response<UserUpdate>>('/user/update-user', data)
