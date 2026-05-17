import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  GraduationCap,
  Home,
  Settings,
} from "lucide-react";

export type AppRoutePath =
  | "/"
  | "/chat/index"
  | "/courses/index"
  | "/courses/learn/:courseId/:title"
  | "/word-book/index"
  | "/setting/index";

export type AppNavigationItem = {
  readonly icon: LucideIcon;
  readonly isAuthRequired: boolean;
  readonly label: string;
  readonly path: AppRoutePath;
};

export const appNavigationItems: readonly AppNavigationItem[] = [
  { icon: Home, isAuthRequired: false, label: "Home", path: "/" },
  { icon: Bot, isAuthRequired: true, label: "Chat", path: "/chat/index" },
  {
    icon: BookOpen,
    isAuthRequired: false,
    label: "Word Book",
    path: "/word-book/index",
  },
  {
    icon: GraduationCap,
    isAuthRequired: false,
    label: "Courses",
    path: "/courses/index",
  },
  {
    icon: Settings,
    isAuthRequired: true,
    label: "Settings",
    path: "/setting/index",
  },
] as const;
