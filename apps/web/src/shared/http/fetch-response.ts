import type { ApiClientOptions, RequestOptions } from "./http-client-types";
import { createRequestBody, createRequestHeaders } from "./request-body";
import { createRequestUrl } from "./request-url";

export type RequestMethod = "GET" | "POST";

export async function fetchResponse(
  options: ApiClientOptions,
  method: RequestMethod,
  path: string,
  requestOptions: RequestOptions,
  accessToken: string | undefined,
): Promise<Response> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    options.timeoutMs,
  );

  try {
    return await fetchImpl(
      createRequestUrl(options.baseUrl, path, requestOptions.params),
      {
        body: method === "POST" ? createRequestBody(requestOptions.body) : null,
        headers: createRequestHeaders(requestOptions.body, accessToken),
        method,
        signal: controller.signal,
      },
    );
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
