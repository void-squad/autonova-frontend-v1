import { createElement, type ComponentType } from "react";
import type { RouteObject } from "react-router-dom";

import { RequireAuth } from "@/components/auth/RequireAuth";

import ProjectsListPage from "./ProjectsListPage";
import ProjectCreatePage from "./ProjectCreatePage";
import ProjectDetailsPage from "./ProjectDetailsPage";

const withEmployeeAuth = (Component: ComponentType): RouteObject["element"] =>
  createElement(RequireAuth, {
    roles: ["Employee"],
    children: createElement(Component),
  });

export const getEmployeeProjectRoutes = (): RouteObject[] => [
  {
    path: "/employee/projects",
    element: withEmployeeAuth(ProjectsListPage),
  },
  {
    path: "/employee/projects/new",
    element: withEmployeeAuth(ProjectCreatePage),
  },
  {
    path: "/employee/projects/:id",
    element: withEmployeeAuth(ProjectDetailsPage),
  },
];
