import { axiosInstance } from "../utils/axios.config";
import type { DoctorDto, UpdateDoctorDto, CreateDoctorDto, CreateDoctorWithAccountDto } from "../models/api.model";

export const doctorService = {
  getAll: async (): Promise<DoctorDto[]> => {
    const response = await axiosInstance.get<DoctorDto[]>('/doctors');
    return response.data;
  },
  
  getById: async (id: number): Promise<DoctorDto> => {
    const response = await axiosInstance.get<DoctorDto>(`/doctors/${id}`);
    return response.data;
  },

  getBySpecialty: async (specialtyId: number): Promise<DoctorDto[]> => {
    const response = await axiosInstance.get<DoctorDto[]>(`/doctors/by-specialty/${specialtyId}`);
    return response.data;
  },

  /** Bác sĩ cập nhật hồ sơ chuyên môn của mình */
  updateProfile: async (doctorId: number, dto: UpdateDoctorDto): Promise<void> => {
    await axiosInstance.put(`/doctors/${doctorId}`, dto);
  },

  // ─── ADMIN ──────────────────────────────────────────────────────────────
  create: async (dto: CreateDoctorDto): Promise<DoctorDto> => {
    const response = await axiosInstance.post<DoctorDto>('/doctors', dto);
    return response.data;
  },

  createWithAccount: async (dto: CreateDoctorWithAccountDto): Promise<DoctorDto> => {
    const response = await axiosInstance.post<DoctorDto>('/doctors/with-account', dto);
    return response.data;
  },

  update: async (id: number, dto: CreateDoctorDto): Promise<void> => {
    await axiosInstance.put(`/doctors/${id}`, dto);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/doctors/${id}`);
  }
};
