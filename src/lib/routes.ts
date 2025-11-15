export const CUSTOMER_ROUTES = {
  dashboard: '/customer/dashboard',
  billing: '/customer/billing',
  vehicles: '/customer/vehicles',
  appointments: '/customer/appointments',
  modifications: '/customer/modifications',
  progress: '/customer/progress',
  projectProgress: (projectId = ':projectId') => `/customer/progress/${projectId}`,
  reports: '/customer/reports',
} as const;

export const EMPLOYEE_ROUTES = {
  dashboard: '/employee/dashboard',
  billing: '/employee/billing',
  tasks: '/employee/tasks',
  timeLogs: '/employee/time-logs',
  reports: '/employee/reports',
} as const;
