export function createRequestUrl(
  baseUrl: string,
  path: string,
  params?: URLSearchParams,
): string {
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  const query = params && params.size > 0 ? `?${params.toString()}` : "";

  return `${base}${suffix}${query}`;
}
