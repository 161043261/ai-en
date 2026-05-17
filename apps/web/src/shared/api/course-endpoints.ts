import type { ApiClient } from "../http";
import { CourseListSchema, type CourseList } from "./course-schema";
import { createResponseSchema } from "./response-schema";

export type CourseEndpoints = {
  readonly getCourseList: () => Promise<CourseList>;
  readonly getMyCourse: () => Promise<CourseList>;
};

export function createCourseEndpoints(client: ApiClient): CourseEndpoints {
  return {
    getCourseList: async () => {
      const response = await client.get(
        "/course/list",
        createResponseSchema(CourseListSchema),
      );
      return response.data;
    },
    getMyCourse: async () => {
      const response = await client.get(
        "/course/my",
        createResponseSchema(CourseListSchema),
      );
      return response.data;
    },
  };
}
