export class HttpRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpRequestError";
    this.status = status;
  }
}

export class NetworkRequestError extends Error {
  constructor(cause: unknown) {
    super("Network request failed.");
    this.name = "NetworkRequestError";
    this.cause = cause;
  }
}
