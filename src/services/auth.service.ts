import { axiosInstance } from "../utils/axios.config";
import type { LoginResponse, UserProfile } from "../models/auth.model";

/** Decode JWT payload (không verify signature – chỉ dùng để đọc claims). */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const authService = {
  login: async (model: any): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      model,
    );
    return response.data;
  },

  register: async (model: any): Promise<any> => {
    const response = await axiosInstance.post("/auth/register", model);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  getMe: async (token?: string): Promise<UserProfile> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axiosInstance.get<UserProfile>("/auth/me", config);
    if (response.data && response.data.roles) {
      response.data.roles = response.data.roles.map((r: string) =>
        (r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()) as any
      );
    }
    // Parse doctorId / patientId từ JWT claims
    const activeToken = token ?? axiosInstance.defaults.headers.common?.["Authorization"]?.toString().replace("Bearer ", "");
    if (activeToken) {
      const payload = decodeJwtPayload(activeToken as string);
      if (payload) {
        if (payload["DoctorId"]) response.data.doctorId = Number(payload["DoctorId"]);
        if (payload["PatientId"]) response.data.patientId = Number(payload["PatientId"]);
      }
    }
    return response.data;
  },

  forgotPassword: async (email: string): Promise<any> => {
    const response = await axiosInstance.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (data: any): Promise<any> => {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
  },
};
