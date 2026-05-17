import { BookOpen, GraduationCap } from "lucide-react";
import type { Course } from "../../shared/api/course-schema";
import { createCourseImageUrl } from "./course-image";

export type CourseCardProps = {
  readonly course: Course;
  readonly mode: "catalog" | "owned";
  readonly openPayment: (course: Course) => void;
  readonly serverBaseUrl: string;
};

export function CourseCard({
  course,
  mode,
  openPayment,
  serverBaseUrl,
}: CourseCardProps) {
  const imageUrl = createCourseImageUrl(serverBaseUrl, course.url);
  const learnUrl = `/courses/learn/${encodeURIComponent(course.id)}/${encodeURIComponent(course.name)}`;

  return (
    <article className="card bg-base-100 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
      <figure className="relative aspect-4/3 bg-base-300">
        <img alt={course.name} className="size-full object-cover" src={imageUrl} />
        <span className="badge badge-primary badge-soft absolute left-4 top-4">
          Vocabulary
        </span>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{course.name}</h2>
        <p className="line-clamp-2 text-sm text-base-content/65">
          {course.description ?? "Focused vocabulary practice course."}
        </p>
        <div className="flex items-center justify-between border-t border-base-300 pt-4">
          <span className="flex items-center gap-2 text-sm text-base-content/55">
            <GraduationCap aria-hidden="true" size={16} />
            {course.teacher}
          </span>
          <span className="text-xl font-black text-primary">¥{course.price}</span>
        </div>
        <div className="card-actions mt-2">
          {mode === "owned" ? (
            <a className="btn btn-primary w-full" href={learnUrl}>
              <BookOpen aria-hidden="true" size={18} />
              Start learning
            </a>
          ) : (
            <button
              className="btn btn-outline btn-primary w-full"
              onClick={() => openPayment(course)}
              type="button"
            >
              Purchase course
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
