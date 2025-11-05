import { AppointmentRequestDto, AppointmentResponseDto } from "@/types";
import { api } from "@/lib/api/axios-config";

export const appointmentApi = {
  create: async (data: AppointmentRequestDto) => {
    const response = await api.post<AppointmentResponseDto>("/appointments", data);
    return response.data;
  },

  reschedule: async (id: string, start: string, end: string) => {
    const response = await api.post<AppointmentResponseDto>(
      `/appointments/${id}/reschedule`,
      null,
      { params: { start, end } }
    );
    return response.data;
  },

  cancel: async (id: string, cancelledBy?: string) => {
    await api.post(`/appointments/${id}/cancel`, null, {
      params: { cancelledBy },
    });
  },

  listByCustomer: async (customerId: string) => {
    const response = await api.get<AppointmentResponseDto[]>(
      `/appointments/customer/${customerId}`
    );
    return response.data;
  },

  checkAvailability: async (start: string, end: string) => {
    const response = await api.get<boolean>("/appointments/availability", {
      params: { start, end },
    });
    return response.data;
  },
}