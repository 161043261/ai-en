import { z } from "zod";

export const CourseSchema = z.object({
  description: z.string().optional(),
  id: z.string(),
  name: z.string(),
  price: z.string(),
  teacher: z.string(),
  url: z.string(),
  value: z.string(),
});

export const CourseListSchema = z.array(CourseSchema);

export type Course = z.infer<typeof CourseSchema>;
export type CourseList = z.infer<typeof CourseListSchema>;
