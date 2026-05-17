import {
  RouterProvider as TanstackRouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import {
  RouterProvider as ReactRouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import type { ReactNode } from "react";
import { ReactRouterLayout, TanstackRouterLayout } from "./app-router-layouts";
import {
  ReactRouterCourseLearnRoute,
  TanstackCourseLearnRoute,
} from "./course-learn-route";
import {
  ChatPage,
  CoursesPage,
  HomePage,
  SettingsPage,
  WordBookPage,
} from "./pages";
import type { RouterProvider } from "../shared/config";
import { assertNever } from "../shared/providers/assert-never";

export type AppRouter = {
  readonly navigateHome: () => void;
  readonly RouterView: () => ReactNode;
};

function createReactRouterApp(): AppRouter {
  const router = createBrowserRouter([
    {
      children: [
        { element: <HomePage />, index: true },
        { element: <ChatPage />, path: "chat/index" },
        { element: <CoursesPage />, path: "courses/index" },
        {
          element: <ReactRouterCourseLearnRoute />,
          path: "courses/learn/:courseId/:title",
        },
        { element: <WordBookPage />, path: "word-book/index" },
        { element: <SettingsPage />, path: "setting/index" },
      ],
      element: <ReactRouterLayout />,
      path: "/",
    },
  ]);

  return {
    navigateHome: () => {
      void router.navigate("/");
    },
    RouterView: function ReactRouterApp() {
      return <ReactRouterProvider router={router} />;
    },
  };
}

function createTanstackRouterApp(): AppRouter {
  const rootRoute = createRootRoute({
    component: TanstackRouterLayout,
  });
  const indexRoute = createRoute({
    component: HomePage,
    getParentRoute: () => rootRoute,
    path: "/",
  });
  const chatRoute = createRoute({
    component: ChatPage,
    getParentRoute: () => rootRoute,
    path: "/chat/index",
  });
  const coursesRoute = createRoute({
    component: CoursesPage,
    getParentRoute: () => rootRoute,
    path: "/courses/index",
  });
  const courseLearnRoute = createRoute({
    component: TanstackCourseLearnRoute,
    getParentRoute: () => rootRoute,
    path: "/courses/learn/$courseId/$title",
  });
  const wordBookRoute = createRoute({
    component: WordBookPage,
    getParentRoute: () => rootRoute,
    path: "/word-book/index",
  });
  const settingsRoute = createRoute({
    component: SettingsPage,
    getParentRoute: () => rootRoute,
    path: "/setting/index",
  });
  const routeTree = rootRoute.addChildren([
    indexRoute,
    chatRoute,
    coursesRoute,
    courseLearnRoute,
    wordBookRoute,
    settingsRoute,
  ]);
  const router = createRouter({ routeTree });

  return {
    navigateHome: () => {
      void router.navigate({ to: "/" });
    },
    RouterView: function TanstackRouterApp() {
      return <TanstackRouterProvider router={router} />;
    },
  };
}

export function createAppRouter(provider: RouterProvider): AppRouter {
  switch (provider) {
    case "react-router":
      return createReactRouterApp();
    case "tanstack":
      return createTanstackRouterApp();
    default:
      return assertNever(provider);
  }
}
