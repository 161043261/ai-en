import type { ApiClient, ApiClientOptions } from "./http-client-types";
import { createRefreshQueue } from "./refresh-queue";
import { createRequestExecutor } from "./request-executor";

export function createApiClient(options: ApiClientOptions): ApiClient {
  const refreshQueue = options.refreshAccessToken
    ? createRefreshQueue(options.refreshAccessToken)
    : null;
  const request = createRequestExecutor({
    clientOptions: options,
    refreshQueue,
  });

  return {
    get: (path, schema, requestOptions) =>
      request("GET", path, schema, requestOptions),
    post: (path, schema, requestOptions) =>
      request("POST", path, schema, requestOptions),
  };
}
