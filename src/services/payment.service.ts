import { axiosInstance } from "../utils/axios.config";

export const paymentService = {
  createPaymentUrl: async (appointmentId: number): Promise<string> => {
    const response = await axiosInstance.post<{ url: string }>(`/payment/create-url/${appointmentId}`);
    return response.data.url;
  }
};
