import { axiosInstance } from "../utils/axios.config";
import { type UpdateProfileDto, type ChangePasswordDto, type PatientDto, type UserDetailDto, type AdminUpdateUserDto } from "../models/api.model";

export const userService = {
  getMe: async (): Promise<PatientDto> => {
    // If backend uses /user/me or /patient/me
    const response = await axiosInstance.get<PatientDto>('/patient/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<void> => {
    await axiosInstance.put('/user/me', data);
  },

  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    await axiosInstance.put('/user/me/change-password', data);
  },

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  getAllUsers: async (): Promise<UserDetailDto[]> => {
    const response = await axiosInstance.get<UserDetailDto[]>('/user');
    return response.data;
  },

  getUserById: async (id: number): Promise<UserDetailDto> => {
    const response = await axiosInstance.get<UserDetailDto>(`/user/${id}`);
    return response.data;
  },

  adminUpdateUser: async (id: number, data: AdminUpdateUserDto): Promise<void> => {
    await axiosInstance.put(`/user/${id}`, data);
  },

  lockUser: async (id: number): Promise<void> => {
    await axiosInstance.patch(`/user/${id}/lock`);
  },

  unlockUser: async (id: number): Promise<void> => {
    await axiosInstance.patch(`/user/${id}/unlock`);
  }
};

