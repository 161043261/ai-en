import {
  CourseLearning,
  type LearnRouteParams,
} from "../../features/learning";

export type CourseLearnPageProps = {
  readonly params: LearnRouteParams | null;
};

export function CourseLearnPage({ params }: CourseLearnPageProps) {
  return <CourseLearning params={params} />;
}
