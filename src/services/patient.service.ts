import { axiosInstance } from "../utils/axios.config";

import type { PatientDto, PatientRecordSummaryDto } from "../models/api.model";

export const patientService = {
  getMe: async (): Promise<PatientDto> => {
    const response = await axiosInstance.get<PatientDto>('/patient/me');
    return response.data;
  },
  updatePatient: async (id: number, dto: any): Promise<void> => {
    await axiosInstance.put(`/patient/${id}`, dto);
  },
  getDoctorPatients: async (doctorId: number): Promise<PatientRecordSummaryDto[]> => {
    const response = await axiosInstance.get<PatientRecordSummaryDto[]>(`/patient/doctor/${doctorId}`);
    return response.data;
  }
};
