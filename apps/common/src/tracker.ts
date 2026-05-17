export interface TrackerConfig {
  userId?: string;
  baseUrl: string;
  uv: {
    api: string;
    updateApi: string;
  };
  pv: {
    api: string;
  };
  event: {
    api: string;
  };
  error: {
    api: string;
  };
  performance: {
    api: string;
  };
}

export interface PvDto {
  visitorId: string;
  url: string;
  referrer: string;
  path: string;
}

export interface UpdateUvDto {
  visitorId: string;
  userId: string;
}

export interface EventDto {
  visitorId: string;
  event: string;
  payload: Record<string, unknown>;
  url: string;
}

export interface ErrorDto {
  visitorId: string;
  error: string;
  message: string;
  stack: string;
  url: string;
}

export interface PerformanceDto {
  visitorId: string;
  fp: number;
  fcp: number;
  lcp: number;
  inp: number;
  cls: number;
}

export interface UvDto {
  anonymousId: string;
  userId?: string | undefined;
  browser: string;
  os: string;
  device: string;
}
