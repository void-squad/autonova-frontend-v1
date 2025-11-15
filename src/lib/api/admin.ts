import { api } from './axios-config';
import {
  Employee,
  EmployeeWithStats,
  EmployeeTask,
  EmployeeWorkload,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  ReassignTaskDto,
  EmployeeStats,
} from '@/types/admin';

export const adminApi = {
  // Employee CRUD Operations
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await api.get<Employee[]>('/admin/employees');
    return response.data;
  },

  getEmployeeById: async (id: string): Promise<EmployeeWithStats> => {
    const response = await api.get<EmployeeWithStats>(`/admin/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data: CreateEmployeeDto): Promise<Employee> => {
    const response = await api.post<Employee>('/admin/employees', {
      ...data,
      role: 'EMPLOYEE',
    });
    return response.data;
  },

  updateEmployee: async (id: string, data: UpdateEmployeeDto): Promise<Employee> => {
    const response = await api.patch<Employee>(`/admin/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete(`/admin/employees/${id}`);
  },

  // Employee Statistics
  getEmployeeStats: async (): Promise<EmployeeStats> => {
    const response = await api.get<EmployeeStats>('/admin/employees/stats');
    return response.data;
  },

  // Task Management
  getEmployeeTasks: async (employeeId?: string): Promise<EmployeeTask[]> => {
    const params = employeeId ? { employeeId } : {};
    const response = await api.get<EmployeeTask[]>('/admin/employees/tasks', { params });
    return response.data;
  },

  reassignTask: async (data: ReassignTaskDto): Promise<void> => {
    await api.post('/admin/employees/tasks/reassign', data);
  },

  // Workload Management
  getAllWorkloads: async (): Promise<EmployeeWorkload[]> => {
    const response = await api.get<EmployeeWorkload[]>('/admin/employees/workload');
    return response.data;
  },

  getEmployeeWorkload: async (employeeId: string): Promise<EmployeeWorkload> => {
    const response = await api.get<EmployeeWorkload>(`/admin/employees/${employeeId}/workload`);
    return response.data;
  },

  // Bulk operations
  updateMultipleStatuses: async (
    employeeIds: string[],
    status: 'active' | 'inactive' | 'on_leave'
  ): Promise<void> => {
    await api.patch('/admin/employees/bulk-status', { employeeIds, status });
  },
};
