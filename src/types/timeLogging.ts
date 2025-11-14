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
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
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

// Active timer data for tracking currently running timer
export interface ActiveTimerData {
  taskId: string;
  taskName: string;
  projectId: string;
  projectTitle: string;
  startedAt: string; // ISO 8601 format
}

// Vehicle information for project display
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
}

// Project task for project task list
export interface ProjectTask {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedHours?: number;
  actualHours: number;
  dueDate?: string; // ISO 8601 date format
}

// Project with nested tasks and vehicle info
export interface Project {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  startDate: string;
  vehicle?: Vehicle;
  tasks?: ProjectTask[];
}

// Time log data for history display (mapped from TimeLogResponse)
export interface TimeLog {
  id: string;
  projectId: string;
  projectTitle: string;
  taskId: string;
  taskName: string;
  employeeId: string;
  employeeName: string;
  hours: number;
  note?: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  loggedAt: string; // ISO 8601 format
}

// Filter options for time log filtering
export interface FilterOptions {
  startDate: string;
  endDate: string;
  projectId: string;
  taskId: string;
}

// Weekly summary data for analytics
export interface WeeklySummaryData {
  dailyHours: {
    day: string;
    hours: number;
  }[];
  projectBreakdown: {
    projectId: string;
    projectTitle: string;
    taskCount: number;
    totalHours: number;
  }[];
}

// Smart suggestion for task recommendations
export interface SmartSuggestion {
  task: ProjectTask;
  projectTitle: string;
  reason: string;
  urgency: "high" | "medium" | "low";
  icon: "deadline" | "progress" | "efficiency" | "priority";
}

// Efficiency metrics data
export interface EfficiencyData {
  efficiency: number;
  weeklyTrend?: number;
  tips?: React.ReactNode[];
  breakdown?: {
    onTime: number;
    overEstimate: number;
    avgTaskTime: number;
  };
}
