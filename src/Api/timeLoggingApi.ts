import axios from "axios";
import { api } from "@/lib/api/client";
import {
  TimeLogResponse,
  TimeLogRequest,
  ProjectResponse,
  TaskResponse,
  TimeLogFormData,
  EmployeeSummaryResponse,
  WeeklySummaryData,
  TimeLog,
  Project,
} from "../types/timeLogging";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api`;

// Create axios instance with auth interceptor
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to map TimeLogResponse to TimeLog
const mapToTimeLog = (response: TimeLogResponse): TimeLog => ({
  id: response.id,
  projectId: response.projectId,
  projectTitle: response.projectTitle,
  taskId: response.taskId,
  taskName: response.taskName,
  employeeId: response.employeeId,
  employeeName: response.employeeName,
  hours: response.hours,
  note: response.note,
  approvalStatus: response.approvalStatus,
  loggedAt: response.loggedAt,
});

// Get employee ID from authenticated user stored in localStorage
const getEmployeeId = (): number => {
  try {
    const authUserStr = localStorage.getItem("authUser");
    if (!authUserStr) {
      console.warn("No authenticated user found in localStorage");
      throw new Error("User not authenticated. Please log in.");
    }
    
    const authUser = JSON.parse(authUserStr);
    if (!authUser.id) {
      console.error("Auth user exists but has no ID:", authUser);
      throw new Error("Invalid user data. Please log in again.");
    }
    
    return authUser.id;
  } catch (error) {
    console.error("Failed to get employee ID:", error);
    throw error;
  }
};

export const timeLoggingApi = {
  // Get all time logs for logged-in employee
  getMyTimeLogs: async (): Promise<TimeLog[]> => {
    const employeeId = getEmployeeId();
    const response = await axiosInstance.get<TimeLogResponse[]>(
      `${API_BASE_URL}/time-logs/employee/${employeeId}`
    );
    return response.data.map(mapToTimeLog);
  },

  // Get time logs for a specific project
  getProjectTimeLogs: async (projectId: string): Promise<TimeLogResponse[]> => {
    const response = await axiosInstance.get<TimeLogResponse[]>(
      `${API_BASE_URL}/time-logs/project/${projectId}`
    );
    return response.data;
  },

  // Get time logs for a specific task
  getTaskTimeLogs: async (taskId: string): Promise<TimeLogResponse[]> => {
    const response = await axiosInstance.get<TimeLogResponse[]>(
      `${API_BASE_URL}/time-logs/task/${taskId}`
    );
    return response.data;
  },

  // Get specific time log by ID
  getTimeLogById: async (id: string): Promise<TimeLogResponse> => {
    const response = await axiosInstance.get<TimeLogResponse>(
      `${API_BASE_URL}/time-logs/${id}`
    );
    return response.data;
  },

  // Get projects assigned to logged-in employee
  getAssignedProjects: async (): Promise<Project[]> => {
    const employeeId = getEmployeeId();
    const response = await axiosInstance.get<ProjectResponse[]>(
      `${API_BASE_URL}/projects/employee/${employeeId}`
    );

    // Fetch tasks for each project and merge
    const projectsWithTasks = await Promise.all(
      response.data.map(async (project) => {
        try {
          const tasksResponse = await axiosInstance.get<TaskResponse[]>(
            `${API_BASE_URL}/tasks/project/${project.id}`
          );

          return {
            id: project.id,
            title: project.title,
            description: project.description,
            status: project.status,
            priority: project.priority,
            startDate: project.startDate,
            vehicle: project.vehicleInfo
              ? {
                  id: project.vehicleId,
                  make: project.vehicleInfo.split(" ")[1] || "",
                  model: project.vehicleInfo.split(" ")[2] || "",
                  licensePlate: "",
                }
              : undefined,
            tasks: tasksResponse.data.map((task) => ({
              id: task.id,
              projectId: task.projectId,
              taskName: task.taskName,
              description: task.description,
              status: task.status,
              priority: task.priority,
              estimatedHours: task.estimatedHours,
              actualHours: task.actualHours,
              dueDate: task.dueDate,
            })),
          } as Project;
        } catch (error) {
          console.error(
            `Failed to fetch tasks for project ${project.id}:`,
            error
          );
          // Return project without tasks if fetch fails
          return {
            id: project.id,
            title: project.title,
            description: project.description,
            status: project.status,
            priority: project.priority,
            startDate: project.startDate,
            tasks: [],
          } as Project;
        }
      })
    );

    return projectsWithTasks;
  },

  // Get all active projects
  getActiveProjects: async (): Promise<Project[]> => {
    const response = await axiosInstance.get<ProjectResponse[]>(
      `${API_BASE_URL}/projects/active`
    );

    // Fetch tasks for each project and merge
    const projectsWithTasks = await Promise.all(
      response.data.map(async (project) => {
        try {
          const tasksResponse = await axiosInstance.get<TaskResponse[]>(
            `${API_BASE_URL}/tasks/project/${project.id}`
          );

          return {
            id: project.id,
            title: project.title,
            description: project.description,
            status: project.status,
            priority: project.priority,
            startDate: project.startDate,
            tasks: tasksResponse.data.map((task) => ({
              id: task.id,
              projectId: task.projectId,
              taskName: task.taskName,
              description: task.description,
              status: task.status,
              priority: task.priority,
              estimatedHours: task.estimatedHours,
              actualHours: task.actualHours,
              dueDate: task.dueDate,
            })),
          } as Project;
        } catch (error) {
          console.error(
            `Failed to fetch tasks for project ${project.id}:`,
            error
          );
          return {
            id: project.id,
            title: project.title,
            description: project.description,
            status: project.status,
            priority: project.priority,
            startDate: project.startDate,
            tasks: [],
          } as Project;
        }
      })
    );

    return projectsWithTasks;
  },

  // Get specific project by ID
  getProjectById: async (projectId: string): Promise<Project> => {
    const response = await axiosInstance.get<ProjectResponse>(
      `${API_BASE_URL}/projects/${projectId}`
    );

    // Fetch tasks for the project
    try {
      const tasksResponse = await axiosInstance.get<TaskResponse[]>(
        `${API_BASE_URL}/tasks/project/${projectId}`
      );

      return {
        id: response.data.id,
        title: response.data.title,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        startDate: response.data.startDate,
        tasks: tasksResponse.data.map((task) => ({
          id: task.id,
          projectId: task.projectId,
          taskName: task.taskName,
          description: task.description,
          status: task.status,
          priority: task.priority,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          dueDate: task.dueDate,
        })),
      } as Project;
    } catch (error) {
      console.error(`Failed to fetch tasks for project ${projectId}:`, error);
      return {
        id: response.data.id,
        title: response.data.title,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        startDate: response.data.startDate,
        tasks: [],
      } as Project;
    }
  },

  // Get tasks for a specific project
  getProjectTasks: async (projectId: string): Promise<TaskResponse[]> => {
    const response = await axiosInstance.get<TaskResponse[]>(
      `${API_BASE_URL}/tasks/project/${projectId}`
    );
    return response.data;
  },

  // Get tasks assigned to logged-in employee
  getMyTasks: async (): Promise<TaskResponse[]> => {
    const employeeId = getEmployeeId();
    const response = await axiosInstance.get<TaskResponse[]>(
      `${API_BASE_URL}/tasks/employee/${employeeId}`
    );
    return response.data;
  },

  // Get incomplete tasks for logged-in employee
  getMyIncompleteTasks: async (): Promise<TaskResponse[]> => {
    const employeeId = getEmployeeId();
    const response = await axiosInstance.get<TaskResponse[]>(
      `${API_BASE_URL}/tasks/employee/${employeeId}/incomplete`
    );
    return response.data;
  },

  // Get specific task by ID
  getTaskById: async (taskId: string): Promise<TaskResponse> => {
    const response = await axiosInstance.get<TaskResponse>(
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
    const response = await axiosInstance.post<TimeLogResponse>(
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
    const response = await axiosInstance.put<TimeLogResponse>(
      `${API_BASE_URL}/time-logs/${id}`,
      requestData
    );
    return response.data;
  },

  // Delete time log
  deleteTimeLog: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_BASE_URL}/time-logs/${id}`);
  },

  // Get total hours for logged-in employee
  getTotalHours: async (): Promise<number> => {
    const employeeId = getEmployeeId();
    const response = await axiosInstance.get<number>(
      `${API_BASE_URL}/time-logs/employee/${employeeId}/total-hours`
    );
    return response.data;
  },

  // Get employee summary (hours, rate, earnings)
  getEmployeeSummary: async (): Promise<EmployeeSummaryResponse> => {
    const employeeId = getEmployeeId();
    const response = await axiosInstance.get<EmployeeSummaryResponse>(
      `${API_BASE_URL}/time-logs/employee/${employeeId}/summary`
    );
    return response.data;
  },

  // Get time logs for employee on specific project
  getEmployeeProjectTimeLogs: async (
    projectId: string
  ): Promise<TimeLogResponse[]> => {
    const employeeId = getEmployeeId();
    const response = await axiosInstance.get<TimeLogResponse[]>(
      `${API_BASE_URL}/time-logs/employee/${employeeId}/project/${projectId}`
    );
    return response.data;
  },

  // Get weekly summary data for analytics
  getWeeklySummary: async (): Promise<WeeklySummaryData> => {
    const employeeId = getEmployeeId();
    const response = await axiosInstance.get<WeeklySummaryData>(
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
    const response = await axiosInstance.get(
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
    const response = await axiosInstance.get(
      `${API_BASE_URL}/time-logs/employee/${employeeId}/efficiency-metrics`
    );
    return response.data;
  },

  // Admin endpoints
  // Get all time logs for admin (all statuses)
  getAllTimeLogs: async (): Promise<TimeLog[]> => {
    const response = await axiosInstance.get<TimeLogResponse[]>(
      `${API_BASE_URL}/time-logs/all`
    );
    return response.data.map(mapToTimeLog);
  },

  // Get all pending time logs for approval
  getPendingTimeLogs: async (): Promise<TimeLog[]> => {
    const response = await axiosInstance.get<TimeLogResponse[]>(
      `${API_BASE_URL}/time-logs/pending`
    );
    return response.data.map(mapToTimeLog);
  },

  // Approve a time log
  approveTimeLog: async (timeLogId: string): Promise<TimeLog> => {
    const response = await axiosInstance.patch<TimeLogResponse>(
      `${API_BASE_URL}/time-logs/${timeLogId}/approve`
    );
    return mapToTimeLog(response.data);
  },

  // Reject a time log
  rejectTimeLog: async (
    timeLogId: string,
    reason: string
  ): Promise<TimeLog> => {
    const response = await axiosInstance.patch<TimeLogResponse>(
      `${API_BASE_URL}/time-logs/${timeLogId}/reject`,
      { reason }
    );
    return mapToTimeLog(response.data);
  },
};

