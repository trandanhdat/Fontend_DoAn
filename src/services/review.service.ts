import { axiosInstance } from "../utils/axios.config";
import type { ReviewDto } from "../models/api.model";

export const reviewService = {
  getByDoctor: async (doctorId: number): Promise<ReviewDto[]> => {
    const response = await axiosInstance.get<ReviewDto[]>(`/review/doctor/${doctorId}`);
    return response.data;
  },
  getByAppointment: async (appointmentId: number): Promise<ReviewDto | null> => {
    try {
      const response = await axiosInstance.get<ReviewDto>(`/review/appointment/${appointmentId}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null; // Return null if no review found
      }
      throw error;
    }
  },
  createReview: async (data: any): Promise<ReviewDto> => {
    const response = await axiosInstance.post<ReviewDto>('/review', data);
    return response.data;
  },
  updateReview: async (reviewId: number, data: any): Promise<ReviewDto> => {
    const response = await axiosInstance.put<ReviewDto>(`/review/${reviewId}`, data);
    return response.data;
  },
  deleteReview: async (reviewId: number): Promise<void> => {
    await axiosInstance.delete(`/review/${reviewId}`);
  }
};
