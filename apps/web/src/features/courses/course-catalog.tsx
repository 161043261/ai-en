import { AuthDialog } from "../auth-ui";
import { useAppServices } from "../../app/use-app-services";
import { EmptyState, ErrorState, LoadingState } from "../../shared/ui";
import { CourseCard } from "./course-card";
import { CourseTabs } from "./course-tabs";
import { PaymentDialog } from "./payment-dialog";
import { useCourseCatalog } from "./use-course-catalog";

export function CourseCatalog() {
  const { config } = useAppServices();
  const state = useCourseCatalog();

  return (
    <div className="flex flex-col gap-8">
      <header className="text-center">
        <div className="badge badge-primary badge-soft mb-3">Vocabulary Courses</div>
        <h1 className="text-4xl font-black">Curated vocabulary tracks</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base-content/65">
          Purchase once, keep access, and practice with focused word batches.
        </p>
      </header>
      <CourseTabs
        isOwnedDisabled={!state.user}
        setTab={state.setTab}
        tab={state.tab}
      />
      {state.error ? <ErrorState /> : null}
      {state.isLoading ? <LoadingState /> : null}
      {!state.isLoading && state.courses.length === 0 ? <EmptyState /> : null}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {state.courses.map((course) => (
          <CourseCard
            course={course}
            key={course.id}
            mode={state.tab}
            openPayment={state.openPayment}
            serverBaseUrl={config.serverApiBaseUrl}
          />
        ))}
      </section>
      <PaymentDialog
        close={state.closePayment}
        course={state.paymentCourse}
        isOpen={Boolean(state.paymentCourse)}
        onSuccess={state.loadCourses}
      />
      <AuthDialog close={state.closeAuth} isOpen={state.isAuthOpen} />
    </div>
  );
}
