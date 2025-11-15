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
  description: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT';
  projectId: string;
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

// Mock data fallback
const MOCK_DASHBOARD_DATA: EmployeeDashboardResponse = {
  employeeInfo: {
    userId: 123,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "EMPLOYEE",
    department: "Service Department"
  },
  stats: {
    totalActiveProjects: 5,
    pendingAppointments: 0,
    completedTasksThisWeek: 12,
    totalRevenueThisMonth: 0.0,
    totalCustomers: 0
  },
  recentActivities: [
    {
      id: "ACT-001",
      type: "PROJECT_UPDATE",
      description: "Updated project PRJ-2024-001 progress to 65%",
      timestamp: "2024-11-08 10:30:00",
      status: "COMPLETED"
    }
  ],
  upcomingTasks: [
    {
      id: "660e8400-e29b-41d4-a716-446655440001",
      title: "Engine Inspection",
      description: "Complete thorough inspection",
      dueDate: "TBD",
      priority: "MEDIUM",
      projectId: "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  activeProjects: [
    {
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      projectName: "Vehicle Repair - Engine Overhaul",
      customerName: "Customer",
      status: "InProgress",
      startDate: "2024-01-15",
      expectedCompletionDate: "2024-02-15",
      progressPercentage: 65
    }
  ]
};

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
    
    // If response is empty or null, fallback to mock data
    if (!response) {
      console.warn('Empty response from employee dashboard API, using mock data');
      return MOCK_DASHBOARD_DATA;
    }
    
    return response;
  } catch (error) {
    console.error('Failed to fetch employee dashboard data:', error);
    // Fallback to mock data on error
    return MOCK_DASHBOARD_DATA;
  }
}
