export interface TrackerConfig {
  userId?: string;
  baseUrl: string;
  uv: {
    api: string; // uv上报接口
    updateApi: string; // uv 更新 userId 接口
  };
  pv: {
    api: string; // pv 上报接口
  };
  event: {
    api: string; // 事件上报接口
  };
  error: {
    api: string; // 错误上报接口
  };
  performance: {
    api: string; // 性能上报接口
  };
}

export interface PvDto {
  visitorId: string; // 游客 ID
  url: string; // 页面 url
  referrer: string; // 源站 url
  path: string; // 页面路径
}

export interface UpdateUvDto {
  visitorId: string; // 游客 ID
  userId: string; // 用户 ID
}

export interface EventDto {
  visitorId: string; // 游客 ID
  event: string; // 事件类型
  payload: Record<string, any>; // 事件数据
  url: string; // 页面 url
}

export interface ErrorDto {
  visitorId: string; // 游客 ID
  error: string; // 错误类型
  message: string; // 错误信息
  stack: string; // 错误堆栈
  url: string; // 页面 url
}

export interface PerformanceDto {
  visitorId: string; // 游客 ID
  fp: number; // FP
  fcp: number; // FCP
  lcp: number; // LCP
  inp: number; // INP
  cls: number; // CLS
}

export interface UvDto {
  anonymousId: string; // 匿名 ID
  userId?: string | undefined; // 用户 ID
  browser: string; // 浏览器
  os: string; // 操作系统
  device: string; // 设备
}
