export function createCourseImageUrl(
  serverBaseUrl: string,
  url: string,
): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = serverBaseUrl.replace(/\/api\/v1$/, "");
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}
