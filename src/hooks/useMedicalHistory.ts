import { useQuery } from '@tanstack/react-query';
import { medicalRecordService } from '../services/medical-record.service';
import { useAuthStore } from '../store/auth.store';
import { patientService } from '../services/patient.service';

export const useMedicalHistory = () => {
  const { user } = useAuthStore();

  const { data: patient } = useQuery({
    queryKey: ['patientMe'],
    queryFn: () => patientService.getMe(),
    enabled: !!user,
  });

  const patientId = patient?.id;

  const { data: medicalRecords, isLoading } = useQuery({
    queryKey: ['patientMedicalRecords', patientId],
    queryFn: () => medicalRecordService.getPatientRecords(patientId!),
    enabled: !!patientId,
  });

  return {
    medicalRecords: medicalRecords || [],
    isLoading,
  };
};
