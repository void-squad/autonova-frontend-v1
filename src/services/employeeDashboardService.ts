import { api, apiConfig, getAuthToken } from '@/lib/api/client';

export interface EmployeeInfo {
  userId: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface DashboardStats {
  totalActiveProjects: number;
  pendingAppointments: number;
  completedTasksThisWeek: number;
  totalRevenueThisMonth: number;
  totalCustomers: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
}

export interface UpcomingTask {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: string;
  projectId: string | null;
}

export interface ActiveProject {
  projectId: string;
  projectName: string;
  customerName: string;
  status: string;
  startDate: string;
  expectedCompletionDate: string;
  progressPercentage: number;
}

export interface EmployeeDashboardResponse {
  employeeInfo: EmployeeInfo;
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  upcomingTasks: UpcomingTask[];
  activeProjects: ActiveProject[];
}

const EMPLOYEE_DASHBOARD_ENDPOINT = `${apiConfig.API_BASE_URL}/api/employee-dashboard`;

export async function fetchEmployeeDashboard(): Promise<EmployeeDashboardResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Missing access token');
    }

    const response = await api<EmployeeDashboardResponse>(EMPLOYEE_DASHBOARD_ENDPOINT, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response) {
      throw new Error('Empty response from employee dashboard API');
    }

    return response;
  } catch (error) {
    console.error('Failed to fetch employee dashboard data:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch employee dashboard data');
  }
}
