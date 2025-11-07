
import { AppointmentRequestDto, AppointmentResponseDto, AppointmentStatus, Vehicle } from "@/types";
import { api } from "@/lib/api/axios-config";


export const appointmentApi = {
  create: async (data: AppointmentRequestDto) => {
    return api<AppointmentResponseDto>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  reschedule: async (id: string, start: string, end: string) => {
    const query = new URLSearchParams({ start, end });
    return api<AppointmentResponseDto>(
      `/api/appointments/${id}/reschedule?${query.toString()}`,
      {
        method: 'POST',
      }
    );
  },

  cancel: async (id: string, cancelledBy?: string | number) => {
    const params = new URLSearchParams();
    if (cancelledBy) {
      params.set('cancelledBy', String(cancelledBy));
    }

    const path = params.size
      ? `/api/appointments/${id}/cancel?${params.toString()}`
      : `/api/appointments/${id}/cancel`;

    await api<void>(path, { method: 'POST' });
  },


  updateStatus: async (id: string, status: AppointmentStatus) => {
    const response = await api.post<AppointmentResponseDto>(
      `/appointments/${id}/status`,
      { status }
    );
    return response.data;
  },

  listByCustomer: async (customerId: string) => {
    const response = await api.get<AppointmentResponseDto[]>(
      `/appointments/customer/${customerId}`

    );
  },

  listAll: async (params?: {
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get<AppointmentResponseDto[]>("/appointments", {
      params,
    });
    return response.data;
  },

  checkAvailability: async (start: string, end: string) => {
    const query = new URLSearchParams({ start, end });
    return api<boolean>(`/api/appointments/availability?${query.toString()}`);
  },
};

// Vehicle API for fetching customer vehicles
export const vehicleApi = {
  listByCustomer: async (customerId: string) => {
    const response = await api.get<Vehicle[]>(`/vehicles/customer/${customerId}`);
    return response.data;
  },
};

