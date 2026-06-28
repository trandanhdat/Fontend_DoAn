import { axiosInstance } from "../utils/axios.config";

export interface ChatbotRequest {
  message: string;
  sessionId?: string;
}

export interface ChatbotResponse {
  answer: string;
  intent?: string;
  bookedAppointment?: any; // You can type this properly based on AppointmentDto
}

export const chatbotService = {
  ask: async (data: ChatbotRequest): Promise<ChatbotResponse> => {
    const response = await axiosInstance.post<ChatbotResponse>("/Chatbot/ask", data);
    return response.data;
  },
};
