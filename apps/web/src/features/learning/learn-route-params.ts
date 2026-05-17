import { z } from "zod";

export const LearnRouteParamsSchema = z.object({
  courseId: z.string().trim().min(1),
  title: z.string().trim().min(1),
});

export type LearnRouteParams = z.infer<typeof LearnRouteParamsSchema>;

export function parseLearnRouteParams(input: unknown): LearnRouteParams {
  return LearnRouteParamsSchema.parse(input);
}

export function parseLearnRoutePath(pathname: string): LearnRouteParams {
  const parts = pathname.split("/");
  return parseLearnRouteParams({
    courseId: decodeURIComponent(parts[3] ?? ""),
    title: decodeURIComponent(parts[4] ?? ""),
  });
}
