export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  estimatedDuration: number; // in minutes
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}

export interface AppointmentRequestDto {
  vehicleId: string;
  serviceType: string;
  startTime: string; // ISO format with offset
  endTime: string; // ISO format with offset
  notes?: string;
  status?: AppointmentStatus; // Optional as backend will set default if not provided
  customerId?: string; // Optional as backend can get from auth context
  assignedEmployeeId?: string; // Optional preferred employee
}

export interface AppointmentResponseDto {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  serviceType: string;
  customerId: string;
  customerName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const SERVICE_TYPES = [
  "General Service",
  "Oil Change",
  "Brake Service",
  "Engine Diagnostics",
  "AC Service",
  "Battery Replacement",
  "Tire Replacement",
  "Wheel Alignment",
  "Full Inspection",
  "Detailing Service"
] as const;

export type ServiceTypeName = typeof SERVICE_TYPES[number];