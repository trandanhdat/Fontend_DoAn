import { axiosInstance } from "../utils/axios.config";
import type { AppointmentDto, CreateAppointmentDto } from "../models/api.model";

export const appointmentService = {
  bookAppointment: async (dto: CreateAppointmentDto): Promise<AppointmentDto> => {
    const response = await axiosInstance.post<AppointmentDto>('/appointments', dto);
    return response.data;
  },
  getPatientAppointments: async (patientId: number): Promise<AppointmentDto[]> => {
    const response = await axiosInstance.get<AppointmentDto[]>(`/appointments/patient/${patientId}`);
    return response.data;
  },
  cancelAppointment: async (id: number): Promise<void> => {
    await axiosInstance.put(`/appointments/${id}/cancel`);
  },
  getById: async (id: number): Promise<AppointmentDto> => {
    const response = await axiosInstance.get<AppointmentDto>(`/appointments/${id}`);
    return response.data;
  },
  getByDoctor: async (doctorId: number): Promise<AppointmentDto[]> => {
    const response = await axiosInstance.get<AppointmentDto[]>(`/appointments/doctor/${doctorId}`);
    return response.data;
  },
  getTodayAppointments: async (doctorId: number): Promise<AppointmentDto[]> => {
    const response = await axiosInstance.get<AppointmentDto[]>(`/appointments/doctor/${doctorId}/today`);
    return response.data;
  },
  confirm: async (id: number): Promise<void> => {
    await axiosInstance.put(`/appointments/${id}/confirm`);
  },
  cancel: async (id: number): Promise<void> => {
    await axiosInstance.put(`/appointments/${id}/cancel`);
  },
  getGeneralAppointments: async (date?: string): Promise<AppointmentDto[]> => {
    const params = date ? { date } : {};
    const response = await axiosInstance.get<AppointmentDto[]>('/appointments/general', { params });
    return response.data;
  },
  assignDoctor: async (id: number, data: { doctorId: number; timeSlotId: number }): Promise<AppointmentDto> => {
    const response = await axiosInstance.put<AppointmentDto>(`/appointments/${id}/assign-doctor`, data);
    return response.data;
  },
  reschedule: async (id: number, data: { appointmentDate?: string; startTime?: string; timeSlotId?: number }): Promise<AppointmentDto> => {
    const response = await axiosInstance.put<AppointmentDto>(`/appointments/${id}/reschedule`, data);
    return response.data;
  },
  checkSpecialtyAvailability: async (specialtyId: number, date: string): Promise<{ morningAvailable: boolean, afternoonAvailable: boolean }> => {
    const response = await axiosInstance.get<{ morningAvailable: boolean, afternoonAvailable: boolean }>('/appointments/specialty-availability', {
      params: { specialtyId, date }
    });
    return response.data;
  },
  checkIn: async (id: number): Promise<void> => {
    await axiosInstance.put(`/appointments/${id}/check-in`);
  },
  getDoctorWaitingList: async (doctorId: number, date: string): Promise<AppointmentDto[]> => {
    const response = await axiosInstance.get<AppointmentDto[]>(`/appointments/doctor/${doctorId}/waiting-list`, {
      params: { date }
    });
    return response.data;
  },
  startExam: async (id: number): Promise<void> => {
    await axiosInstance.put(`/appointments/${id}/start-exam`);
  },
  markNoShow: async (id: number): Promise<void> => {
    await axiosInstance.put(`/appointments/${id}/no-show`);
  },
  getAllTodayAppointments: async (date: string): Promise<AppointmentDto[]> => {
    const response = await axiosInstance.get<AppointmentDto[]>('/appointments/today/all', {
      params: { date }
    });
    return response.data;
  }
};
