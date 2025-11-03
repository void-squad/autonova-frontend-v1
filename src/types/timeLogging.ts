// Response from backend API
export interface TimeLogResponse {
  id: string;
  projectId: string;
  projectTitle: string;
  taskId: string;
  taskName: string;
  employeeId: string;
  employeeName: string;
  hours: number;
  note?: string;
  loggedAt: string; // ISO 8601 format
}

// Request payload for creating/updating time logs
export interface TimeLogRequest {
  projectId: string;
  taskId: string;
  employeeId: string;
  hours: number;
  note?: string;
}

// Project response from backend
export interface ProjectResponse {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleInfo: string; // "2020 Toyota Camry"
  projectType: "SERVICE" | "MODIFICATION";
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedCost?: number;
  startDate: string; // ISO 8601 date format
  endDate?: string;
}

// Task response from backend
export interface TaskResponse {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  estimatedHours?: number;
  actualHours: number;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string; // ISO 8601 date format
}

// Task response from backend
export interface TaskResponse {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  estimatedHours?: number;
  actualHours: number;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string; // ISO 8601 date format
}

// Employee summary response from backend
export interface EmployeeSummaryResponse {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  hourlyRate: number;
  totalEarnings: number;
}

// Form data for creating time logs
export interface TimeLogFormData {
  projectId: string;
  taskId: string;
  hours: number;
  note?: string;
}

// Dashboard statistics
export interface TimeLogStats {
  todayHours: number;
  weekHours: number;
  monthHours: number;
  totalEarnings: number;
  activeProjects: number;
  pendingTasks: number;
}
