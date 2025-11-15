export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TaskStatus = 'assigned' | 'in_progress' | 'completed' | 'blocked' | 'overdue';

export interface ServiceTask {
  id: string;
  appointmentId: string;
  serviceTypeId: string;
  serviceTypeName: string;
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  licensePlate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  assignedEmployeeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledStartTime: string;
  scheduledEndTime: string;
  estimatedDurationMinutes: number;
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
}

export interface ModificationProject {
  id: string;
  title: string;
  description?: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  licensePlate: string;
  assigneeId: string;
  status: 'planned' | 'in_progress' | 'blocked' | 'completed' | 'canceled';
  priority: TaskPriority;
  progressPct: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeStats {
  assignedServices: number;
  assignedProjects: number;
  inProgressServices: number;
  inProgressProjects: number;
  completedToday: number;
  urgentTasks: number;
  overdueTasks: number;
  totalHoursThisWeek: number;
}

// Time Logging Types
export interface TimeLogStats {
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
  totalHoursToday: number;
  dailyHours: DailyHours[];
  recentLogs: RecentTimeLog[];
  averageHoursPerDay: number;
  totalLogs: number;
  mostProductiveDay: MostProductiveDay | null;
}

export interface DailyHours {
  date: string; // ISO date (YYYY-MM-DD)
  hours: number;
  logCount: number;
}

export interface RecentTimeLog {
  id: string;
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  hours: number;
  note: string | null;
  loggedAt: string; // ISO timestamp
}

export interface MostProductiveDay {
  date: string;
  hours: number;
}

export interface EmployeeWorkItem {
  id: string;
  type: 'service' | 'project';
  title: string;
  description?: string;
  customer: string;
  vehicle: string;
  priority: TaskPriority;
  status: TaskStatus | 'planned' | 'in_progress' | 'blocked' | 'completed' | 'canceled';
  estimatedTime?: string;
  dueDate?: string;
  progress?: number;
}
