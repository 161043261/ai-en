import axios, { AxiosError, type AxiosResponse } from 'axios'
import type { Token } from '@ai-en/common/types/user'
import { type Response } from '..'

const authApi = axios.create({
  baseURL: '/api/v1',
  timeout: 50000,
})

// 响应拦截器
authApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err: AxiosError) => {
    return Promise.reject(err)
  },
)

export const refreshTokenApi = (data: Omit<Token, 'accessToken'>) => {
  return authApi.post<Response<Token>>('/user/refresh-token', data)
}
