import { axiosInstance } from "../utils/axios.config";
import type { DashboardSummaryDto, DailyCountDto, TopDoctorDto } from "../models/api.model";

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummaryDto> => {
    const response = await axiosInstance.get<DashboardSummaryDto>('/dashboard/summary');
    return response.data;
  },

  getAppointmentsByDay: async (days: number = 30): Promise<DailyCountDto[]> => {
    const response = await axiosInstance.get<DailyCountDto[]>(`/dashboard/appointments-by-day?days=${days}`);
    return response.data;
  },

  getTopDoctors: async (limit: number = 5): Promise<TopDoctorDto[]> => {
    const response = await axiosInstance.get<TopDoctorDto[]>(`/dashboard/top-doctors?limit=${limit}`);
    return response.data;
  }
};
