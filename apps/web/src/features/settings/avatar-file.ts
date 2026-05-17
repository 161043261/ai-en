import { z } from "zod";

const maxAvatarSizeBytes = 5 * 1024 * 1024;
const supportedAvatarTypes: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const AvatarFileSchema = z
  .instanceof(File)
  .refine((file) => supportedAvatarTypes.has(file.type), {
    message: "Avatar must be a png, jpg, or webp image.",
  })
  .refine((file) => file.size <= maxAvatarSizeBytes, {
    message: "Avatar cannot exceed 5MB.",
  });

export function getAvatarFileError(file: File): string | null {
  const result = AvatarFileSchema.safeParse(file);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "Invalid avatar file.";
}
