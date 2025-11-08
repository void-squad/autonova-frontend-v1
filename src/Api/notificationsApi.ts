import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const notificationsApi = {
  // Fetch latest notifications for a user
  getNotifications: async (userId: string | number) => {
    const res = await axios.get(`${API_BASE}/api/notifications/${userId}`);
    return res.data;
  },

  // Mark a single notification as read
  markRead: async (id: string) => {
    const res = await axios.post(`${API_BASE}/api/notifications/${id}/read`);
    return res.data;
  },

  // Mark all notifications as read for a user
  markAllRead: async (userId: string | number) => {
    const res = await axios.post(`${API_BASE}/api/notifications/${userId}/read-all`);
    return res.data;
  },

  // Subscribe to server-sent events for real-time notifications.
  // Backend SSE endpoint: /api/notifications/stream/{userId}
  // eventTypes: array of SSE event names to listen for (e.g. ['message','notification'])
  subscribe: (
    userId: string | number,
    onMessage: (data: any) => void,
    eventTypes: string[] = ['message', 'notification', 'status', 'reminder', 'system']
  ) => {
    const url = `${API_BASE}/api/notifications/stream/${userId}`;
    const es = new EventSource(url);

    const listeners: { event: string; handler: (e: MessageEvent) => void }[] = [];

    eventTypes.forEach((ev) => {
      const handler = (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          onMessage(parsed);
        } catch (err) {
          onMessage(e.data);
        }
      };
      es.addEventListener(ev, handler as EventListener);
      listeners.push({ event: ev, handler });
    });

    // Also listen for generic 'message' events via onmessage if it's not in eventTypes
    if (!eventTypes.includes('message')) {
      es.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          onMessage(parsed);
        } catch (err) {
          onMessage(e.data);
        }
      };
    }

    es.onerror = () => {
      // keep silent, consumers can implement retry or logging if desired
    };

    return () => {
      listeners.forEach(({ event, handler }) => es.removeEventListener(event, handler as EventListener));
      es.close();
    };
  },

  // Get unread count for a user
  unreadCount: async (userId: string | number) => {
    const res = await axios.get(`${API_BASE}/api/notifications/${userId}/unread-count`);
    return res.data as number;
  },
};
