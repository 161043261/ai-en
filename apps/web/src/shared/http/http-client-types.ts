import type { z } from "zod";

export type RequestBody = FormData | object | readonly unknown[];

export type RequestOptions = {
  readonly body?: RequestBody;
  readonly params?: URLSearchParams;
};

export type ApiClient = {
  readonly get: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    options?: RequestOptions,
  ) => Promise<z.infer<Schema>>;
  readonly post: <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    options?: RequestOptions,
  ) => Promise<z.infer<Schema>>;
};

export type ApiClientOptions = {
  readonly baseUrl: string;
  readonly fetchImpl?: typeof fetch;
  readonly getAccessToken?: () => string | undefined;
  readonly onAuthExpired?: () => void;
  readonly refreshAccessToken?: () => Promise<string>;
  readonly timeoutMs: number;
};
