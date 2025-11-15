export interface Employee {
  id: string;
  userName: string;
  email: string;
  contactOne: string;
  contactTwo?: string;
  address?: string;
  role: 'EMPLOYEE' | 'ADMIN' | 'CUSTOMER';
  status: 'active' | 'inactive' | 'on_leave';
  specialization?: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeWithStats extends Employee {
  stats: {
    assignedTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    completedThisMonth: number;
    hoursThisMonth: number;
    averageRating: number;
    efficiency: number;
  };
}

export interface EmployeeTask {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'service' | 'project';
  title: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'blocked' | 'overdue';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  dueDate?: string;
  customer: string;
  vehicle: string;
}

export interface EmployeeWorkload {
  employeeId: string;
  employeeName: string;
  totalTasks: number;
  inProgressTasks: number;
  urgentTasks: number;
  overdueTasks: number;
  utilizationRate: number; // percentage
  availableCapacity: number; // percentage
}

export interface CreateEmployeeDto {
  userName: string;
  email: string;
  password: string;
  contactOne: string;
  contactTwo?: string;
  address?: string;
  specialization?: string;
  role?: 'EMPLOYEE';
}

export interface UpdateEmployeeDto {
  userName?: string;
  email?: string;
  contactOne?: string;
  contactTwo?: string;
  address?: string;
  specialization?: string;
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface ReassignTaskDto {
  taskId: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  reason?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  averageWorkload: number;
  overloadedEmployees: number;
}
