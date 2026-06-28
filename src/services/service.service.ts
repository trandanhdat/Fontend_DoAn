import { axiosInstance } from "../utils/axios.config";
import type { ServiceResponseDto, CreateServiceDto } from "../models/api.model";

export const serviceService = {
  getBySpecialty: async (specialtyId: number): Promise<ServiceResponseDto[]> => {
    const response = await axiosInstance.get<ServiceResponseDto[]>(`/service`, {
      params: { specialtyId }
    });
    return response.data;
  },

  getAll: async (): Promise<ServiceResponseDto[]> => {
    const response = await axiosInstance.get<ServiceResponseDto[]>('/service');
    return response.data;
  },

  create: async (dto: CreateServiceDto): Promise<ServiceResponseDto> => {
    const response = await axiosInstance.post<ServiceResponseDto>('/service', dto);
    return response.data;
  },

  update: async (id: number, dto: CreateServiceDto): Promise<void> => {
    await axiosInstance.put(`/service/${id}`, dto);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/service/${id}`);
  }
};
