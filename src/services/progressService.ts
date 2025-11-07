import axios from "axios";
import { DEMO_PROGRESS, createDemoMessage } from './demoData';

const API_BASE_URL = "http://localhost:8083/api"; // same backend base used elsewhere; adjust if needed

export type ProgressMessage = {
  id: string;
  authorId?: string;
  authorName?: string;
  content: string;
  createdAt: string; // ISO
  attachmentUrl?: string | null;
};

export type ProjectProgress = {
  projectId: string;
  status: string;
  progressPercentage?: number; // 0-100
  messages: ProgressMessage[];
};

// Simple singleton SSE manager per projectId
const eventSources: Map<string, EventSource> = new Map();
const listeners: Map<string, Set<(data: ProjectProgress) => void>> = new Map();

export const progressService = {
  // Initial REST load
  getProjectProgress: async (projectId: string): Promise<ProjectProgress> => {
    // demo mode shortcut
    if (projectId === 'demo') {
      // simulate network latency
      await new Promise((r) => setTimeout(r, 150));
      return DEMO_PROGRESS;
    }

    const resp = await axios.get<ProjectProgress>(`${API_BASE_URL}/projects/${projectId}/progress`);
    return resp.data;
  },

  // Get project details. For demo projectId === 'demo' return demo project.
  getProjectDetails: async (projectId: string) => {
    if (projectId === 'demo') {
      // lazy import to avoid circular dependency at type-level
      const { DEMO_PROJECT } = await import('./demoData');
      // return the demo project object
      return DEMO_PROJECT;
    }

    const resp = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
    return resp.data;
  },

  // Post a new progress message (employee)
  // message may include an optional file attachment. If file is present we send multipart/form-data
  // message may include attachments; if attachments are provided we send multipart/form-data
  postProgressMessage: async (
    projectId: string,
    message: { content: string; attachments?: File[] },
  ) => {
    // demo handling: create a fake message and return it
    if (projectId === 'demo') {
      const attachmentUrl = message.attachments && message.attachments.length > 0 ? 'https://placehold.co/600x400' : null;
      const newMsg = createDemoMessage(message.content, 'Demo Employee', attachmentUrl ?? undefined);
      // emulate network delay
      await new Promise((r) => setTimeout(r, 100));
      return newMsg;
    }

    if (message.attachments && message.attachments.length > 0) {
      const form = new FormData();
      form.append('content', message.content);
      message.attachments.forEach((f) => form.append('attachments', f));
      const resp = await axios.post<ProgressMessage>(
        `${API_BASE_URL}/projects/${projectId}/progress/messages`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return resp.data;
    }

    const resp = await axios.post<ProgressMessage>(
      `${API_BASE_URL}/projects/${projectId}/progress/messages`,
      { content: message.content },
    );
    return resp.data;
  },

  // Update project status (employee)
  updateProjectStatus: async (projectId: string, status: { status: string }) => {
    const resp = await axios.post<{ status: string }>(`${API_BASE_URL}/projects/${projectId}/status`, status);
    return resp.data;
  },

  // Subscribe to server-sent events for a project's progress stream.
  // Returns an unsubscribe function.
  // Assumptions: SSE endpoint at /projects/{projectId}/progress/stream emitting JSON payloads representing ProjectProgress
  subscribeToProjectProgress: (
    projectId: string,
    onUpdate: (data: ProjectProgress) => void,
    onError?: (err: any) => void,
  ) => {
    // register listener set
    if (!listeners.has(projectId)) listeners.set(projectId, new Set());
    listeners.get(projectId)!.add(onUpdate);

    // ensure EventSource exists
    if (!eventSources.has(projectId)) {
      try {
        const es = new EventSource(`${API_BASE_URL.replace(/^http/, 'http')}/projects/${projectId}/progress/stream`);
        es.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data) as ProjectProgress;
            const set = listeners.get(projectId);
            set?.forEach((fn) => fn(data));
          } catch (e) {
            console.error('Invalid SSE JSON', e);
          }
        };
        es.onerror = (err) => {
          console.error('SSE error', err);
          onError?.(err);
        };
        eventSources.set(projectId, es);
      } catch (err) {
        console.error('Failed to create EventSource', err);
        onError?.(err);
      }
    }

    // return unsubscribe
    return () => {
      const set = listeners.get(projectId);
      set?.delete(onUpdate);
      if (!set || set.size === 0) {
        // close EventSource
        const es = eventSources.get(projectId);
        if (es) {
          es.close();
          eventSources.delete(projectId);
        }
        listeners.delete(projectId);
      }
    };
  },
};

export default progressService;
