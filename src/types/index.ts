export type Role = 'Admin' | 'Employee' | 'Customer';

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  roles: Role[];
  avatarUrl?: string;
  status: 'active' | 'disabled';
};

export type Vehicle = {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
};

export * from './appointment';

export type ProjectStatus = 'planned' | 'in_progress' | 'blocked' | 'completed' | 'canceled';

export type Project = {
  id: string;
  title: string;
  description?: string;
  customerId: string;
  vehicleId: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  progressPct: number;
  assigneeId?: string;
};

export type TimeLog = {
  id: string;
  employeeId: string;
  projectId?: string;
  appointmentId?: string;
  task: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  notes?: string;
  loggedAt: string;
  reviewed?: boolean;
};

export type Invoice = {
  id: string;
  customerId: string;
  items: { description: string; qty: number; unitPrice: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'due' | 'paid' | 'void';
  issuedAt: string;
  paidAt?: string;
  paymentRef?: string;
};

export type Notification = {
  id: string;
  type: 'status' | 'reminder' | 'payment' | 'system';
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
  customerId?: string;
  projectId?: string;
  appointmentId?: string;
};

export type ServicePrice = {
  id: string;
  name: string;
  basePrice: number;
  description?: string;
  active: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = AuthTokens & {
  user: User;
};
