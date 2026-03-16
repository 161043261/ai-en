import axios, { type AxiosResponse } from 'axios'

export const timeout = 50000

export const mainApi = axios.create({
  baseURL: '/api/v1',
  timeout,
})

const data = (res: AxiosResponse) => res.data

mainApi.interceptors.response.use(data)

export const aiApi = axios.create({
  baseURL: '/api/ai/v1',
  timeout,
})

aiApi.interceptors.response.use(data)

export interface Response<T = unknown> {
  data: T
  message: string
  code: number
  ok: boolean
  timestamp: string
  path: string
}
