import clsx from "clsx";
import type { CourseTab } from "./use-course-catalog";

export type CourseTabsProps = {
  readonly isOwnedDisabled: boolean;
  readonly setTab: (tab: CourseTab) => void;
  readonly tab: CourseTab;
};

export function CourseTabs({ isOwnedDisabled, setTab, tab }: CourseTabsProps) {
  return (
    <div className="tabs tabs-box w-fit">
      <button
        className={clsx("tab", tab === "catalog" && "tab-active")}
        onClick={() => setTab("catalog")}
        type="button"
      >
        Featured courses
      </button>
      <button
        className={clsx("tab", tab === "owned" && "tab-active")}
        disabled={isOwnedDisabled}
        onClick={() => setTab("owned")}
        type="button"
      >
        My courses
      </button>
    </div>
  );
}
