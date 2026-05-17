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
      <figure className="bg-base-300 relative aspect-4/3">
        <img
          alt={course.name}
          className="size-full object-cover"
          src={imageUrl}
        />
        <span className="badge badge-primary badge-soft absolute top-4 left-4">
          Vocabulary
        </span>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{course.name}</h2>
        <p className="text-base-content/65 line-clamp-2 text-sm">
          {course.description ?? "Focused vocabulary practice course."}
        </p>
        <div className="border-base-300 flex items-center justify-between border-t pt-4">
          <span className="text-base-content/55 flex items-center gap-2 text-sm">
            <GraduationCap aria-hidden="true" size={16} />
            {course.teacher}
          </span>
          <span className="text-primary text-xl font-black">
            ¥{course.price}
          </span>
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
