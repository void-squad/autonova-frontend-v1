export type ProjectStatus =
  | "PendingReview"
  | "Approved"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type TaskStatus =
  | "Requested"
  | "Accepted"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export interface ProjectSummary {
  projectId: string;
  vehicleId: string;
  title: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  requestedStart?: string;
  requestedEnd?: string;
  approvedStart?: string;
  approvedEnd?: string;
}

export interface ProjectTask {
  taskId: string;
  title: string;
  serviceType: string;
  detail?: string;
  status: TaskStatus;
  assigneeId?: string;
  estimateHours?: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  appointmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectActivity {
  id: number;
  taskId?: string;
  actorId: string;
  actorRole: string;
  message: string;
  createdAt: string;
}

export interface ProjectDetails extends ProjectSummary {
  customerId: string;
  description?: string;
  appointmentId?: string;
  appointmentSnapshot?: string;
  tasks: ProjectTask[];
  activity: ProjectActivity[];
}

export interface ApproveProjectPayload {
  approvedStart?: string;
  approvedEnd?: string;
  tasks: Array<{
    taskId: string;
    assigneeId?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
  }>;
}

export interface CreateTaskPayload {
  title: string;
  serviceType: string;
  detail?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}
