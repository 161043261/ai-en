import { z } from "zod";
import { fetchResponse, type RequestMethod } from "./fetch-response";
import {
  getApiErrorEnvelope,
  getHttpErrorMessage,
  readJsonResponse,
} from "./http-error-response";
import { HttpRequestError, NetworkRequestError } from "./http-error";
import type { ApiClientOptions, RequestOptions } from "./http-client-types";
import type { RefreshQueue } from "./refresh-queue";

export type RequestExecutor = <Schema extends z.ZodType>(
  method: RequestMethod,
  path: string,
  schema: Schema,
  requestOptions?: RequestOptions,
) => Promise<z.infer<Schema>>;

export type RequestExecutorOptions = {
  readonly clientOptions: ApiClientOptions;
  readonly refreshQueue: RefreshQueue | null;
};

export function createRequestExecutor(
  options: RequestExecutorOptions,
): RequestExecutor {
  const run = async <Schema extends z.ZodType>(
    method: RequestMethod,
    path: string,
    schema: Schema,
    requestOptions: RequestOptions = {},
    accessToken = options.clientOptions.getAccessToken?.(),
    hasRetriedAuth = false,
  ): Promise<z.infer<Schema>> => {
    try {
      const response = await fetchResponse(
        options.clientOptions,
        method,
        path,
        requestOptions,
        accessToken,
      );

      if (response.status === 401 && options.refreshQueue && !hasRetriedAuth) {
        const nextToken = await options.refreshQueue
          .refresh()
          .catch((error: unknown) => {
            options.clientOptions.onAuthExpired?.();
            throw error;
          });

        return run(method, path, schema, requestOptions, nextToken, true);
      }

      const responseBody = await readJsonResponse(response);
      const errorEnvelope = getApiErrorEnvelope(responseBody);
      if (errorEnvelope) {
        throw new HttpRequestError(errorEnvelope.message, errorEnvelope.code);
      }

      if (!response.ok) {
        throw new HttpRequestError(
          getHttpErrorMessage(response, responseBody),
          response.status,
        );
      }

      return schema.parse(responseBody);
    } catch (error) {
      if (error instanceof HttpRequestError || error instanceof z.ZodError) {
        throw error;
      }

      throw new NetworkRequestError(error);
    }
  };

  return (method, path, schema, requestOptions) =>
    run(method, path, schema, requestOptions);
}
