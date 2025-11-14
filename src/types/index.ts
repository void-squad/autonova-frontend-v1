export type Role = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export interface AuthUser {
  id: number;
  userName: string;
  email: string;
  role: string;
  name?: string | null;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  contactOne?: string | null;
  contactTwo?: string | null;
  address?: string | null;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUser extends AuthUser {
  password?: string;
}

export interface ProfileCustomer {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phoneNumber?: string | null;
  vehicles?: Vehicle[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  user: ProfileUser;
  customer?: ProfileCustomer | null;
}

export interface Customer {
  id: number;
  userName: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  contactOne: string;
  phoneNumber?: string | null;
  contactTwo?: string | null;
  address?: string | null;
  enabled?: boolean;
  vehicles?: Vehicle[];
}

export interface CustomerUpdate {
  userName?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  contactOne?: string;
  contactTwo?: string | null;
  address?: string | null;
  password?: string;
  enabled?: boolean;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  customerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type VehicleInput = Omit<Vehicle, 'id'>;

export * from './appointment';
export * from './billing';

export type ProjectStatus =
  | 'planned'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'canceled';

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

export interface LoginResponse {
  token: string;
  type: string;
  user: AuthUser;
}
