import { useParams as useTanstackParams } from "@tanstack/react-router";
import { z } from "zod";
import { useParams as useReactRouterParams } from "react-router-dom";
import {
  parseLearnRouteParams,
  type LearnRouteParams,
} from "../features/learning";
import { CourseLearnPage } from "./pages";

function safeParseLearnRouteParams(input: unknown): LearnRouteParams | null {
  try {
    return parseLearnRouteParams(input);
  } catch (error) {
    if (error instanceof z.ZodError) return null;
    throw error;
  }
}

export function ReactRouterCourseLearnRoute() {
  return (
    <CourseLearnPage
      params={safeParseLearnRouteParams(useReactRouterParams())}
    />
  );
}

export function TanstackCourseLearnRoute() {
  const params: unknown = useTanstackParams({ strict: false });

  return <CourseLearnPage params={safeParseLearnRouteParams(params)} />;
}
