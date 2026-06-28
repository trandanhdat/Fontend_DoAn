import { axiosInstance } from "../utils/axios.config";
import type { SpecialtyResponseDto, SpecialtyDetailResponseDto, CreateSpecialtyDto } from "../models/api.model";

export const specialtyService = {
  getAllActive: async (): Promise<SpecialtyResponseDto[]> => {
    const response = await axiosInstance.get<SpecialtyResponseDto[]>('/specialty');
    return response.data;
  },
  
  getDetail: async (id: number): Promise<SpecialtyDetailResponseDto> => {
    const response = await axiosInstance.get<SpecialtyDetailResponseDto>(`/specialty/${id}`);
    return response.data;
  },

  // ─── ADMIN ──────────────────────────────────────────────────────────────
  getAll: async (): Promise<SpecialtyResponseDto[]> => {
    const response = await axiosInstance.get<SpecialtyResponseDto[]>('/specialty/all');
    return response.data;
  },

  create: async (dto: CreateSpecialtyDto): Promise<SpecialtyResponseDto> => {
    const response = await axiosInstance.post<SpecialtyResponseDto>('/specialty', dto);
    return response.data;
  },

  update: async (id: number, dto: CreateSpecialtyDto): Promise<void> => {
    await axiosInstance.put(`/specialty/${id}`, dto);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/specialty/${id}`);
  }
};
