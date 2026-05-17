import type { RequestBody } from "./http-client-types";

export function createRequestBody(
  body: RequestBody | undefined,
): BodyInit | null {
  if (!body) {
    return null;
  }

  if (body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
}

export function createRequestHeaders(
  body: RequestBody | undefined,
  accessToken: string | undefined,
): Headers {
  const headers = new Headers();

  if (body && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}
