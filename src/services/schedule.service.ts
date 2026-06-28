import { axiosInstance } from "../utils/axios.config";
import type { TimeSlotDto, DoctorScheduleDto, CreateScheduleDto } from "../models/api.model";

export const scheduleService = {
  getAvailableSlots: async (doctorId: number, date?: string): Promise<TimeSlotDto[]> => {
    const params = date ? { date } : {};
    const response = await axiosInstance.get<TimeSlotDto[]>(`/doctorschedule/slots/${doctorId}`, { params });
    return response.data;
  },
  getAllSlots: async (doctorId: number, date?: string): Promise<TimeSlotDto[]> => {
    const params = date ? { date, all: true } : { all: true };
    const response = await axiosInstance.get<TimeSlotDto[]>(`/doctorschedule/slots/${doctorId}`, { params });
    return response.data;
  },
  getDoctorSchedules: async (doctorId: number): Promise<DoctorScheduleDto[]> => {
    const response = await axiosInstance.get<DoctorScheduleDto[]>(`/DoctorSchedule/doctor/${doctorId}`);
    return response.data;
  },
  getByDoctor: async (doctorId: number): Promise<DoctorScheduleDto[]> => {
    const response = await axiosInstance.get<DoctorScheduleDto[]>(`/DoctorSchedule/doctor/${doctorId}`);
    return response.data;
  },
  getSlotsByDate: async (doctorId: number, date: string): Promise<TimeSlotDto[]> => {
    const response = await axiosInstance.get<TimeSlotDto[]>(`/doctorschedule/slots/${doctorId}`, { params: { date } });
    return response.data;
  },
  create: async (dto: CreateScheduleDto): Promise<DoctorScheduleDto> => {
    const response = await axiosInstance.post<DoctorScheduleDto>('/DoctorSchedule', dto);
    return response.data;
  },
  blockSlot: async (slotId: number): Promise<void> => {
    await axiosInstance.patch(`/doctorschedule/slots/${slotId}/block`);
  },
  unblockSlot: async (slotId: number): Promise<void> => {
    await axiosInstance.patch(`/doctorschedule/slots/${slotId}/unblock`);
  }
};
