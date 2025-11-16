import { api } from './axios-config';
import { ServiceTask, ModificationProject, EmployeeStats, EmployeeWorkItem, TimeLogStats } from '@/types/employee';

// Dashboard data interface - aggregated response from BFF
export interface EmployeeDashboardData {
  stats: EmployeeStats;
  timeLogStats: TimeLogStats;
  workItems: EmployeeWorkItem[];
  urgentTasks: EmployeeWorkItem[];
  overdueTasks: EmployeeWorkItem[];
}

export const employeeApi = {
  // ==========================================
  // BFF Endpoint - Single aggregated call
  // ==========================================
  
  /**
   * Get complete dashboard data in a single call.
   * This calls the BFF (Backend For Frontend) endpoint which aggregates data from:
   * - Projects Service
   * - Tasks/Services Service
   * - Time Logs Service
   * - Auth Service
   */
  getDashboardData: async (): Promise<EmployeeDashboardData> => {
    const response = await api.get<EmployeeDashboardData>('/employee/dashboard');
    return response.data;
  },

  // ==========================================
  // Legacy Individual Endpoints (kept for backward compatibility)
  // ==========================================
  
  // Get employee dashboard statistics
  getStats: async (): Promise<EmployeeStats> => {
    const response = await api.get<EmployeeStats>('/employee/stats');
    return response.data;
  },

  // Get time logging statistics
  getTimeLogStats: async (): Promise<TimeLogStats> => {
    const response = await api.get<TimeLogStats>('/employee/time-logs/stats');
    return response.data;
  },

  // Get assigned service tasks
  getServiceTasks: async (status?: string): Promise<ServiceTask[]> => {
    const params = status ? { status } : {};
    const response = await api.get<ServiceTask[]>('/employee/services', { params });
    return response.data;
  },

  // Get assigned modification projects
  getProjects: async (status?: string): Promise<ModificationProject[]> => {
    const params = status ? { status } : {};
    const response = await api.get<ModificationProject[]>('/employee/projects', { params });
    return response.data;
  },

  // Get all work items (services + projects)
  getAllWorkItems: async (): Promise<EmployeeWorkItem[]> => {
    console.log('[DEBUG] Fetching all work items from /employee/work-items');
    const response = await api.get<EmployeeWorkItem[]>('/employee/work-items');
    console.log('[DEBUG] Received work items:', response.data);
    console.log('[DEBUG] Total work items count:', response.data?.length || 0);
    return response.data;
  },

  // Get urgent tasks
  getUrgentTasks: async (): Promise<EmployeeWorkItem[]> => {
    const response = await api.get<EmployeeWorkItem[]>('/employee/work-items/urgent');
    return response.data;
  },

  // Get overdue tasks
  getOverdueTasks: async (): Promise<EmployeeWorkItem[]> => {
    const response = await api.get<EmployeeWorkItem[]>('/employee/work-items/overdue');
    return response.data;
  },

  // Update service task status
  updateServiceStatus: async (taskId: string, status: string): Promise<ServiceTask> => {
    const response = await api.patch<ServiceTask>(`/employee/services/${taskId}/status`, { status });
    return response.data;
  },

  // Update project status
  updateProjectStatus: async (projectId: string, status: string, progress?: number): Promise<ModificationProject> => {
    const response = await api.patch<ModificationProject>(`/employee/projects/${projectId}/status`, { 
      status,
      progressPct: progress 
    });
    return response.data;
  },

  // Start service task
  startService: async (taskId: string): Promise<ServiceTask> => {
    const response = await api.post<ServiceTask>(`/employee/services/${taskId}/start`);
    return response.data;
  },

  // Complete service task
  completeService: async (taskId: string, notes?: string): Promise<ServiceTask> => {
    const response = await api.post<ServiceTask>(`/employee/services/${taskId}/complete`, { notes });
    return response.data;
  },

  // Get service task details
  getServiceTaskDetails: async (taskId: string): Promise<ServiceTask> => {
    const response = await api.get<ServiceTask>(`/employee/services/${taskId}`);
    return response.data;
  },

  // Get project details
  getProjectDetails: async (projectId: string): Promise<ModificationProject> => {
    const response = await api.get<ModificationProject>(`/employee/projects/${projectId}`);
    return response.data;
  },
};
