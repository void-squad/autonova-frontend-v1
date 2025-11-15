import { api, apiConfig, sanitizeBaseUrl } from "@/lib/api/client";
import type {
  ProjectSummary,
  ProjectDetails,
  ApproveProjectPayload,
  CreateTaskPayload,
  ProjectTask,
  TaskStatus,
} from "@/types/project";
import type { AdminAppointment } from "@/types/appointment";

const resolveLocalProjectBase = () => {
  if (typeof window === "undefined") return undefined;
  const proto = window.location.protocol === "https:" ? "https:" : "http:";
  const port =
    import.meta.env.VITE_PROJECT_API_PORT ??
    import.meta.env.VITE_PROJECT_PORT ??
    "8082";
  return `${proto}//${window.location.hostname}:${port}`;
};

const resolveLocalGatewayBase = () => {
  if (typeof window === "undefined") return undefined;
  const proto = window.location.protocol === "https:" ? "https:" : "http:";
  const port =
    import.meta.env.VITE_GATEWAY_API_PORT ?? import.meta.env.VITE_GATEWAY_PORT ?? "8080";
  return `${proto}//${window.location.hostname}:${port}`;
};

// // Prefer hitting the API through the gateway during local/dev runs. Fall back to direct project
// // service base URLs if explicitly provided.

const projectApiBaseUrl =
  sanitizeBaseUrl(import.meta.env.VITE_GATEWAY_API_BASE_URL) ??
  sanitizeBaseUrl(import.meta.env.VITE_PROJECT_API_BASE_URL) ??
  sanitizeBaseUrl(resolveLocalGatewayBase()) ??
  sanitizeBaseUrl(resolveLocalProjectBase()) ??
  apiConfig.API_BASE_URL;

if (import.meta.env.DEV) {
  // Helpful when wiring up multiple services locally
  console.info(`[projectService] using API base: ${projectApiBaseUrl}`);
}

const projectApi = async <T>(path: string, options?: RequestInit) =>
  api<T>(path, { ...(options ?? {}), baseUrl: projectApiBaseUrl });

const toQuery = (params: Record<string, string | undefined>) =>
  Object.entries(params)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? "")}`)
    .join("&");

export const listAdminProjects = async (status?: string): Promise<ProjectSummary[]> => {
  const query = status ? `?${toQuery({ status })}` : "";
  return projectApi<ProjectSummary[]>(`/api/admin/projects${query}`);
};

export const getAdminProject = async (projectId: string): Promise<ProjectDetails> => {
  return projectApi<ProjectDetails>(`/api/admin/projects/${projectId}`);
};

export const approveProject = async (projectId: string, payload: ApproveProjectPayload): Promise<void> => {
  await projectApi(`/api/admin/projects/${projectId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const createAdminTask = async (projectId: string, payload: CreateTaskPayload): Promise<ProjectTask> => {
  return projectApi<ProjectTask>(`/api/admin/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const fetchCustomerProjects = async (): Promise<ProjectSummary[]> => {
  return projectApi<ProjectSummary[]>(`/api/projects/mine`);
};

export const getProjectDetails = async (projectId: string): Promise<ProjectDetails> => {
  return projectApi<ProjectDetails>(`/api/projects/${projectId}`);
};

export const cancelProject = async (projectId: string): Promise<void> => {
  await projectApi(`/api/projects/${projectId}/cancel`, { method: "POST" });
};

export const fetchAssignedTasks = async (): Promise<ProjectTask[]> => {
  return projectApi<ProjectTask[]>(`/api/tasks/assigned`);
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus, note?: string): Promise<void> => {
  await projectApi(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
};

export const listAdminAppointments = async (status?: string, from?: string, to?: string): Promise<AdminAppointment[]> => {
  const query = toQuery({
    status,
    from,
    to,
  });
  const suffix = query ? `?${query}` : "";
  return projectApi<AdminAppointment[]>(`/api/admin/appointments${suffix}`);
};

export const getAdminAppointment = async (id: string): Promise<AdminAppointment> => {
  return projectApi<AdminAppointment>(`/api/admin/appointments/${id}`);
};

export const updateAdminAppointmentStatus = async (id: string, status: string, adminNote?: string): Promise<void> => {
  await projectApi(`/api/admin/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminNote }),
  });
};
