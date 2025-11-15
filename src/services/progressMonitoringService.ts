import { api, apiConfig } from "@/lib/api/client";
import type { 
  ProjectMessage, 
  ProjectStatusSummary, 
  CreateStatusRequest 
} from "@/types/progressMonitoring";

// Use the same gateway base URL as other services
const progressApiBaseUrl = apiConfig.API_BASE_URL;

if (import.meta.env.DEV) {
  console.info(`[progressMonitoringService] using API base (via gateway): ${progressApiBaseUrl}`);
}

const progressApi = async <T>(path: string, options?: RequestInit) =>
  api<T>(path, { ...(options ?? {}), baseUrl: progressApiBaseUrl });

/**
 * Get all project statuses for the current customer
 */
export const getMyProjectStatuses = async (): Promise<ProjectStatusSummary[]> => {
  return progressApi<ProjectStatusSummary[]>("/api/projects/my/statuses");
};

/**
 * Get all messages for a specific project
 */
export const getProjectMessages = async (projectId: string): Promise<ProjectMessage[]> => {
  return progressApi<ProjectMessage[]>(`/api/projects/${projectId}/messages`);
};

/**
 * Get paginated messages for a project
 */
export const getProjectMessagesPage = async (
  projectId: string,
  page: number = 0,
  size: number = 20
): Promise<{ content: ProjectMessage[]; hasNext: boolean }> => {
  const response = await progressApi<{ content: ProjectMessage[]; hasNext: boolean }>(
    `/api/projects/${projectId}/messages/page?page=${page}&size=${size}`
  );
  return response;
};

/**
 * Get messages before a specific timestamp
 */
export const getProjectMessagesBefore = async (
  projectId: string,
  before: string,
  size: number = 20
): Promise<{ content: ProjectMessage[]; hasNext: boolean }> => {
  const response = await progressApi<{ content: ProjectMessage[]; hasNext: boolean }>(
    `/api/projects/${projectId}/messages/before?before=${encodeURIComponent(before)}&size=${size}`
  );
  return response;
};

/**
 * Get messages after a specific timestamp
 */
export const getProjectMessagesAfter = async (
  projectId: string,
  after: string,
  size: number = 20
): Promise<{ content: ProjectMessage[]; hasNext: boolean }> => {
  const response = await progressApi<{ content: ProjectMessage[]; hasNext: boolean }>(
    `/api/projects/${projectId}/messages/after?after=${encodeURIComponent(after)}&size=${size}`
  );
  return response;
};

/**
 * Post a new status message (Employee only)
 */
export const postStatusMessage = async (
  projectId: string,
  request: CreateStatusRequest
): Promise<ProjectMessage> => {
  return progressApi<ProjectMessage>(`/api/projects/${projectId}/messages`, {
    method: "POST",
    body: JSON.stringify(request),
  });
};

/**
 * Upload a file and create a message with attachment (Employee only)
 */
export const uploadAndCreateMessage = async (
  projectId: string,
  file: File,
  message: string,
  category?: string
): Promise<ProjectMessage> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("message", message);
  if (category) {
    formData.append("category", category);
  }

  const token = localStorage.getItem("token");
  const response = await fetch(
    `${progressApiBaseUrl}/api/projects/${projectId}/messages/upload`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Create an SSE connection for live updates on a project
 */
export const subscribeToProjectUpdates = (
  projectId: string,
  onMessage: (message: ProjectMessage) => void,
  onError?: (error: Event) => void
): EventSource => {
  const token = localStorage.getItem("token");
  // Use gateway URL for SSE connection
  const url = new URL(`${progressApiBaseUrl}/sse/projects/${projectId}`);
  
  // EventSource doesn't support custom headers, so pass token as query param
  // The backend JWT filter supports `access_token` query parameter for SSE
  if (token) {
    url.searchParams.set("access_token", token);
  }
  
  const eventSource = new EventSource(url.toString());

  eventSource.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("Failed to parse SSE message:", err);
    }
  });

  eventSource.addEventListener("connected", (event) => {
    console.log("SSE connected:", event.data);
  });

  eventSource.onerror = (error) => {
    console.error("SSE error:", error);
    if (onError) {
      onError(error);
    }
  };

  return eventSource;
};
