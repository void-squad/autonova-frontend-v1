import axios from "axios";
import {
  TimeLogResponse,
  TimeLogRequest,
  ProjectResponse,
  TaskResponse,
  TimeLogFormData,
  EmployeeSummaryResponse,
  WeeklySummaryData,
} from "../types/timeLogging";

const API_BASE_URL = "http://localhost:8083/api";

// Get employee ID from auth context or localStorage
const getEmployeeId = (): string => {
  // Will replace this with actual auth logic when Auth Service is integrated
  return localStorage.getItem("employeeId") || "emp-001";
};

export const timeLoggingApi = {
  // Get all time logs for logged-in employee
  getMyTimeLogs: async (): Promise<TimeLogResponse[]> => {
    const employeeId = getEmployeeId();
    const response = await axios.get<TimeLogResponse[]>(
      `${API_BASE_URL}/time-logs/employee/${employeeId}`
    );
    return response.data;
  },

  // Get time logs for a specific project
  getProjectTimeLogs: async (projectId: string): Promise<TimeLogResponse[]> => {
    const response = await axios.get<TimeLogResponse[]>(
      `${API_BASE_URL}/time-logs/project/${projectId}`
    );
    return response.data;
  },

  // Get time logs for a specific task
  getTaskTimeLogs: async (taskId: string): Promise<TimeLogResponse[]> => {
    const response = await axios.get<TimeLogResponse[]>(
      `${API_BASE_URL}/time-logs/task/${taskId}`
    );
    return response.data;
  },

  // Get specific time log by ID
  getTimeLogById: async (id: string): Promise<TimeLogResponse> => {
    const response = await axios.get<TimeLogResponse>(
      `${API_BASE_URL}/time-logs/${id}`
    );
    return response.data;
  },

  // Get projects assigned to logged-in employee
  getAssignedProjects: async (): Promise<ProjectResponse[]> => {
    const employeeId = getEmployeeId();
    const response = await axios.get<ProjectResponse[]>(
      `${API_BASE_URL}/projects/employee/${employeeId}`
    );
    return response.data;
  },

  // Get all active projects
  getActiveProjects: async (): Promise<ProjectResponse[]> => {
    const response = await axios.get<ProjectResponse[]>(
      `${API_BASE_URL}/projects/active`
    );
    return response.data;
  },

  // Get specific project by ID
  getProjectById: async (projectId: string): Promise<ProjectResponse> => {
    const response = await axios.get<ProjectResponse>(
      `${API_BASE_URL}/projects/${projectId}`
    );
    return response.data;
  },

  // Get tasks for a specific project
  getProjectTasks: async (projectId: string): Promise<TaskResponse[]> => {
    const response = await axios.get<TaskResponse[]>(
      `${API_BASE_URL}/tasks/project/${projectId}`
    );
    return response.data;
  },

  // Get tasks assigned to logged-in employee
  getMyTasks: async (): Promise<TaskResponse[]> => {
    const employeeId = getEmployeeId();
    const response = await axios.get<TaskResponse[]>(
      `${API_BASE_URL}/tasks/employee/${employeeId}`
    );
    return response.data;
  },

  // Get incomplete tasks for logged-in employee
  getMyIncompleteTasks: async (): Promise<TaskResponse[]> => {
    const employeeId = getEmployeeId();
    const response = await axios.get<TaskResponse[]>(
      `${API_BASE_URL}/tasks/employee/${employeeId}/incomplete`
    );
    return response.data;
  },

  // Get specific task by ID
  getTaskById: async (taskId: string): Promise<TaskResponse> => {
    const response = await axios.get<TaskResponse>(
      `${API_BASE_URL}/tasks/${taskId}`
    );
    return response.data;
  },

  // Create a new time log
  createTimeLog: async (data: TimeLogFormData): Promise<TimeLogResponse> => {
    const employeeId = getEmployeeId();
    const requestData: TimeLogRequest = {
      ...data,
      employeeId,
    };
    const response = await axios.post<TimeLogResponse>(
      `${API_BASE_URL}/time-logs`,
      requestData
    );
    return response.data;
  },

  // Update time log
  updateTimeLog: async (
    id: string,
    data: TimeLogFormData
  ): Promise<TimeLogResponse> => {
    const employeeId = getEmployeeId();
    const requestData: TimeLogRequest = {
      ...data,
      employeeId,
    };
    const response = await axios.put<TimeLogResponse>(
      `${API_BASE_URL}/time-logs/${id}`,
      requestData
    );
    return response.data;
  },

  // Delete time log
  deleteTimeLog: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/time-logs/${id}`);
  },

  // Get total hours for logged-in employee
  getTotalHours: async (): Promise<number> => {
    const employeeId = getEmployeeId();
    const response = await axios.get<number>(
      `${API_BASE_URL}/time-logs/employee/${employeeId}/total-hours`
    );
    return response.data;
  },

  // Get employee summary (hours, rate, earnings)
  getEmployeeSummary: async (): Promise<EmployeeSummaryResponse> => {
    const employeeId = getEmployeeId();
    const response = await axios.get<EmployeeSummaryResponse>(
      `${API_BASE_URL}/time-logs/employee/${employeeId}/summary`
    );
    return response.data;
  },

  // Get time logs for employee on specific project
  getEmployeeProjectTimeLogs: async (
    projectId: string
  ): Promise<TimeLogResponse[]> => {
    const employeeId = getEmployeeId();
    const response = await axios.get<TimeLogResponse[]>(
      `${API_BASE_URL}/time-logs/employee/${employeeId}/project/${projectId}`
    );
    return response.data;
  },

  // Get weekly summary data for analytics
  getWeeklySummary: async (): Promise<WeeklySummaryData> => {
    const employeeId = getEmployeeId();
    const response = await axios.get<WeeklySummaryData>(
      `${API_BASE_URL}/time-logs/employee/${employeeId}/weekly-summary`
    );
    return response.data;
  },

  // Get smart suggestions for next tasks
  getSmartSuggestions: async (): Promise<
    {
      task: TaskResponse;
      projectTitle: string;
      reason: string;
      urgency: "high" | "medium" | "low";
      icon: "deadline" | "progress" | "efficiency" | "priority";
    }[]
  > => {
    const employeeId = getEmployeeId();
    const response = await axios.get(
      `${API_BASE_URL}/time-logs/employee/${employeeId}/smart-suggestions`
    );
    return response.data;
  },

  // Get efficiency metrics and productivity data
  getEfficiencyMetrics: async (): Promise<{
    efficiency: number;
    weeklyTrend?: number;
    tips?: string[];
    breakdown?: {
      onTime: number;
      overEstimate: number;
      avgTaskTime: number;
    };
  }> => {
    const employeeId = getEmployeeId();
    const response = await axios.get(
      `${API_BASE_URL}/time-logs/employee/${employeeId}/efficiency-metrics`
    );
    return response.data;
  },
};
