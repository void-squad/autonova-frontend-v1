export type EventCategory =
  | "CREATED"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "UPDATED"
  | "APPLIED";

export interface ProjectMessage {
  id: string;
  projectId: string;
  category: EventCategory;
  message: string;
  payload?: string;
  occurredAt: string;
  createdAt: string;
  attachmentUrl?: string;
  attachmentContentType?: string;
  attachmentFilename?: string;
  attachmentSize?: number;
}

export interface ProjectStatusSummary {
  project: {
    projectId: string;
    title: string;
    status: string;
    vehicleId: string;
    customerId: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
  lastMessage?: {
    message: string;
    occurredAt: string;
    category: EventCategory;
  };
}

export interface CreateStatusRequest {
  category?: EventCategory;
  message: string;
  payload?: string;
  occurredAt?: string;
  attachmentUrl?: string;
  attachmentContentType?: string;
  attachmentFilename?: string;
  attachmentSize?: number;
}

export interface SseEvent {
  type: string;
  data: string;
}
