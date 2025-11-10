import { AppointmentRequestDto, AppointmentResponseDto } from '@/types';
import { api } from '@/lib/api/axios-config';

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

  listByCustomer: async (customerId: string | number) => {
    return api<AppointmentResponseDto[]>(
      `/api/appointments/customer/${customerId}`
    );
  },

  checkAvailability: async (start: string, end: string) => {
    const query = new URLSearchParams({ start, end });
    return api<boolean>(`/api/appointments/availability?${query.toString()}`);
  },
};
