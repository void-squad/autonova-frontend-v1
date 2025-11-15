export type ProjectStatus = "pending" | "approved" | "in_progress" | "completed" | "cancelled";

export interface Project {
  id: string;
  code: string;
  customerName: string;
  title: string;
  status: ProjectStatus;
  priority?: "low" | "medium" | "high";
  description?: string;
  createdAt: string;
  updatedAt: string;
  assigneeIds: string[];
  startDate?: string;
  endDate?: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  hours: number;
  rate: number;
}

export type QuoteStatus = "draft" | "approved";

export interface Quote {
  id: string;
  projectId: string;
  subtotal: number;
  tax: number;
  total: number;
  status: QuoteStatus;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  type: string;
  message: string;
  at: string;
}
