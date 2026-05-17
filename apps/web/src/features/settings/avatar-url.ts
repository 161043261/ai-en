export function createAvatarUrl(
  serverBaseUrl: string,
  avatar: string | null | undefined,
): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }
  const baseUrl = serverBaseUrl.replace(/\/api\/v1$/, "");
  return `${baseUrl}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
}
