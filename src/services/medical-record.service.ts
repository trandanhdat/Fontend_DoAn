import { axiosInstance } from "../utils/axios.config";
import type { MedicalRecordDto, CreateMedicalRecordDto } from "../models/api.model";

export const medicalRecordService = {
  getPatientRecords: async (patientId: number): Promise<MedicalRecordDto[]> => {
    const response = await axiosInstance.get<MedicalRecordDto[]>(`/medicalrecord/patient/${patientId}`);
    return response.data;
  },
  createRecord: async (dto: CreateMedicalRecordDto): Promise<MedicalRecordDto> => {
    const response = await axiosInstance.post<MedicalRecordDto>('/medicalrecord', dto);
    return response.data;
  },
  getMedicalRecordDetail: async (id: number): Promise<MedicalRecordDto> => {
    const response = await axiosInstance.get<MedicalRecordDto>(`/medicalrecord/${id}`);
    return response.data;
  },
  getRecordByAppointment: async (appointmentId: number): Promise<MedicalRecordDto> => {
    const response = await axiosInstance.get<MedicalRecordDto>(`/medicalrecord/appointment/${appointmentId}`);
    return response.data;
  }
};
