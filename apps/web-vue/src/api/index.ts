import router from '@/router'
import { useUserStore } from '@/stores/user'
import axios, { AxiosError, type AxiosResponse } from 'axios'
import { refreshTokenApi } from './auth'
import { ElMessage } from 'element-plus'

export const mainApi = axios.create({
  baseURL: '/api/v1',
  timeout: 50000,
})

// 请求拦截器
mainApi.interceptors.request.use((config) => {
  const userStore = useUserStore()
  const { accessToken } = userStore
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let requestQueue: ((newAccessToken: string) => void)[] = []

// 响应拦截器
mainApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err: AxiosError) => {
    if (err.code === 'ERR_NETWORK') {
      ElMessage.error('Network error')
      return Promise.reject(err)
    }
    if (!err.response || err.response.status !== 401) {
      return Promise.reject(err)
    }
    const requestConfig = err.config
    const userStore = useUserStore()
    const { accessToken, refreshToken, clear, updateToken } = userStore
    if (!requestConfig || !accessToken || !refreshToken) {
      clear()
      router.push('/')
      return Promise.reject(err)
    }
    if (isRefreshing) {
      return new Promise((resolve) => {
        requestQueue.push((newAccessToken: string) => {
          requestConfig.headers.Authorization = `Bearer ${newAccessToken}`

          // 重新发送请求
          const res = mainApi(requestConfig)
          resolve(res)
        })
      })
    }

    isRefreshing = true
    try {
      const { data: newToken } = await refreshTokenApi({ refreshToken })
      if (newToken.ok) {
        updateToken(newToken.data)
      } else {
        clear()
        router.replace('/')
        return Promise.reject(err)
      }
      const newAccessToken = newToken.data.accessToken
      requestConfig.headers.Authorization = `Bearer ${newAccessToken}`
      requestQueue.forEach((callback) => callback(newAccessToken))

      // 重新发送请求
      return mainApi(requestConfig)
    } catch (err2) {
      return Promise.reject(err2)
    } finally {
      isRefreshing = false
      requestQueue = []
    }
  },
)

export const aiApi = axios.create({
  baseURL: '/api/ai/v1',
  timeout: 50000,
})

aiApi.interceptors.response.use((res: AxiosResponse) => res)

export interface Response<T = unknown> {
  data: T
  message: string
  code: number
  ok: boolean
  timestamp: string
  path: string
}
