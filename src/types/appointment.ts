export interface AppointmentRequestDto {
  vehicleId: string;
  serviceTypeId: string;
  startTime: string; // ISO format with offset
  endTime: string; // ISO format with offset
  notes?: string;
}

export interface AppointmentResponseDto {
  id: string;
  vehicleId: string;
  serviceTypeId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}