import { mainApi, type Response } from '..'
import type { UserLogin, UserRegister, WebResultUser } from '@ai-en/common/types/user'

export const login = (data: UserLogin) =>
  mainApi.post('/user/login', data) as Promise<Response<WebResultUser>>

export const register = (data: UserRegister) =>
  mainApi.post('/user/register', data) as Promise<Response<WebResultUser>>
