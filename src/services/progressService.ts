import axios from "axios";
import { DEMO_PROGRESS, createDemoMessage } from './demoData';
import { api, apiConfig, getAuthToken } from '@/lib/api/client';

// Use API base from app config when constructing SSE full URL
const API_BASE_URL = apiConfig.API_BASE_URL ?? 'http://localhost:8080';

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

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

function mapDtoToMessage(dto: any): ProgressMessage {
  return {
    id: dto.id ?? String(dto.id ?? Date.now()),
    authorId: dto.authorId ?? undefined,
    authorName: dto.authorName ?? dto.author ?? dto.source ?? 'System',
    content: dto.message ?? dto.content ?? dto.payload ?? '',
    createdAt: dto.createdAt ?? dto.occurredAt ?? new Date().toISOString(),
    attachmentUrl: dto.attachmentUrl ?? dto.attachmentUrl ?? null,
  };
}

// Simple singleton SSE manager per projectId
const eventSources: Map<string, EventSource> = new Map();
const listeners: Map<string, Set<(data: ProjectProgress) => void>> = new Map();

// connection status tracking
const connectionStatus: Map<string, ConnectionStatus> = new Map();
const statusListeners: Map<string, Set<(status: ConnectionStatus) => void>> = new Map();

function setStatus(projectId: string, status: ConnectionStatus) {
  connectionStatus.set(projectId, status);
  const set = statusListeners.get(projectId);
  set?.forEach((cb) => cb(status));
}

export const progressService = {
  // Initial REST load
  getProjectProgress: async (projectId: string): Promise<ProjectProgress> => {
    // demo mode shortcut
    if (projectId === 'demo') {
      // simulate network latency
      await new Promise((r) => setTimeout(r, 150));
      return DEMO_PROGRESS;
    }

    // backend exposes messages under /api/projects/{id}/messages; frontend expects a ProjectProgress shape
    const dtos = await api<any[]>(`/projects/${encodeURIComponent(projectId)}/messages`);
    const messages = (dtos ?? []).map(mapDtoToMessage);
    // derive minimal ProjectProgress from messages (backend doesn't expose aggregate progress via this endpoint)
    return {
      projectId,
      status: 'unknown',
      progressPercentage: undefined,
      messages,
    };
  },

  // Get project details. For demo projectId === 'demo' return demo project.
  getProjectDetails: async (projectId: string) => {
    if (projectId === 'demo') {
      // lazy import to avoid circular dependency at type-level
      const { DEMO_PROJECT } = await import('./demoData');
      // return the demo project object
      return DEMO_PROJECT;
    }

    return api(`/projects/${encodeURIComponent(projectId)}`);
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
      // backend expects the 'message' part to be a plain string and 'file' for each attachment
      form.append('message', message.content);
      message.attachments.forEach((f) => form.append('file', f));
      // Build the upload URL from API_BASE_URL origin so we hit /sse and upload endpoints correctly
      let uploadBase = API_BASE_URL;
      try {
        // new URL handles relative or absolute API_BASE_URL
        const full = new URL(API_BASE_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        uploadBase = full.origin; // scheme://host:port
      } catch (e) {
        // fallback to raw string
      }

      const resp = await fetch(`${uploadBase}/api/projects/${encodeURIComponent(projectId)}/messages/upload`, {
        method: 'POST',
        body: form,
        credentials: 'include',
        headers: (() => {
          const t = getAuthToken();
          return t ? { Authorization: `Bearer ${t}` } : undefined;
        })(),
      });
      if (!resp.ok) throw new Error(`Upload failed: ${resp.status}`);
      const dto = await resp.json();
      return mapDtoToMessage(dto);
    }

    // simple message post
    const dto = await api<any>(`/projects/${encodeURIComponent(projectId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message: message.content }),
    });
    return mapDtoToMessage(dto);
  },

  // Update project status (employee)
  updateProjectStatus: async (projectId: string, status: { status: string }) => {
    return api<{ status: string }>(`/projects/${encodeURIComponent(projectId)}/status`, {
      method: 'POST',
      body: JSON.stringify(status),
    });
  },

  // Subscribe to server-sent events for a project's progress stream.
  // Returns an unsubscribe function.
  // SSE endpoint: /sse/projects/{projectId}
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
        // derive SSE base from API base origin (so '/sse' is at server root)
        let sseBase = API_BASE_URL;
        try {
          const full = new URL(API_BASE_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
          sseBase = full.origin; // scheme://host:port
        } catch (e) {
          // ignore
        }

        const url = `${sseBase}/sse/projects/${encodeURIComponent(projectId)}`;
        // if an auth token exists, append as access_token so EventSource can be authenticated via query param
        const token = getAuthToken();
        const sseUrl = token ? `${url}?access_token=${encodeURIComponent(token)}` : url;
        setStatus(projectId, 'connecting');
        const es = new EventSource(sseUrl, { withCredentials: true } as EventSourceInit);

        es.onopen = () => setStatus(projectId, 'connected');
        es.onmessage = (ev) => {
          // fallback for untyped/default server messages (not using named events)
          try {
            const data = JSON.parse(ev.data) as ProjectProgress;
            const set = listeners.get(projectId);
            set?.forEach((fn) => fn(data));
          } catch (e) {
            // ignore parse error
          }
        };
        es.addEventListener('project.update', (ev: MessageEvent) => {
          try {
            const data = JSON.parse((ev as MessageEvent).data) as ProjectProgress;
            const set = listeners.get(projectId);
            set?.forEach((fn) => fn(data));
          } catch (e) {
            console.error('Invalid SSE JSON', e);
          }
        });

        es.addEventListener('project.message', (ev: MessageEvent) => {
          // project.message events contain a plain message string; we can convert it to a minimal ProjectProgress update
          try {
            const message = (ev as MessageEvent).data as string;
            const set = listeners.get(projectId);
            const minimal: ProjectProgress = { projectId, status: 'unknown', messages: [{ id: crypto?.randomUUID?.() ?? String(Date.now()), content: message, createdAt: new Date().toISOString() }] };
            set?.forEach((fn) => fn(minimal));
          } catch (e) {
            console.error('Invalid SSE message', e);
          }
        });

        es.onerror = (err) => {
          console.error('SSE error', err);
          setStatus(projectId, 'error');
          onError?.(err);
        };

        // cleanup handling on close: when client code closes EventSource we call es.close() and then set status
        const origClose = es.close.bind(es);
        (es as any).close = () => {
          origClose();
          setStatus(projectId, 'disconnected');
        };

        eventSources.set(projectId, es);
        // initial status if onopen hasn't fired yet
      } catch (err) {
        console.error('Failed to create EventSource', err);
        setStatus(projectId, 'error');
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
        // status becomes disconnected
        setStatus(projectId, 'disconnected');
      }
    };
  },

  // Subscribe to connection status updates (initially returns current status if any)
  subscribeToConnectionStatus: (projectId: string, cb: (status: ConnectionStatus) => void) => {
    if (!statusListeners.has(projectId)) statusListeners.set(projectId, new Set());
    statusListeners.get(projectId)!.add(cb);
    // emit current status immediately
    const cur = connectionStatus.get(projectId) ?? 'disconnected';
    cb(cur);
    return () => {
      const set = statusListeners.get(projectId);
      set?.delete(cb);
      if (!set || set.size === 0) statusListeners.delete(projectId);
    };
  },

  // utility to get current status synchronously
  getConnectionStatus: (projectId: string): ConnectionStatus => connectionStatus.get(projectId) ?? 'disconnected',
};

export default progressService;
