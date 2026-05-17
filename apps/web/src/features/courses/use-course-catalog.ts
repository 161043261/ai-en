import { useEffect, useState } from "react";
import { useAuthSession } from "../auth";
import { useAppServices } from "../../app/use-app-services";
import type { Course, CourseList } from "../../shared/api/course-schema";

export type CourseTab = "catalog" | "owned";

export function useCourseCatalog() {
  const { api, session } = useAppServices();
  const { user } = useAuthSession(session);
  const [courses, setCourses] = useState<CourseList>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentCourse, setPaymentCourse] = useState<Course | null>(null);
  const [tab, setTab] = useState<CourseTab>("catalog");

  const loadCourses = () => {
    setIsLoading(true);
    setError(null);
    const request = tab === "owned" ? api.course.getMyCourse : api.course.getCourseList;
    void request()
      .then(setCourses)
      .catch(() => setError("Unable to load courses."))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadCourses, [api.course, tab]);

  const openPayment = (course: Course) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setPaymentCourse(course);
  };

  return {
    closeAuth: () => setIsAuthOpen(false),
    closePayment: () => setPaymentCourse(null),
    courses,
    error,
    isAuthOpen,
    isLoading,
    loadCourses,
    openPayment,
    paymentCourse,
    setTab,
    tab,
    user,
  };
}
