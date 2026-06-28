import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';
import { medicalRecordService } from '../services/medical-record.service';
import { notificationService } from '../services/notification.service';
import { useAuthStore } from '../store/auth.store';
import { patientService } from '../services/patient.service';

export const usePatientDashboard = () => {
  const { user } = useAuthStore();

  const { data: patient } = useQuery({
    queryKey: ['patientMe'],
    queryFn: () => patientService.getMe(),
    enabled: !!user,
  });

  const patientId = patient?.id;

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['patientAppointments', patientId],
    queryFn: () => appointmentService.getPatientAppointments(patientId!),
    enabled: !!patientId,
  });

  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['patientMedicalRecords', patientId],
    queryFn: () => medicalRecordService.getPatientRecords(patientId!),
    enabled: !!patientId,
  });

  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    enabled: !!user,
  });

  return {
    patient,
    appointments: appointments || [],
    medicalRecords: medicalRecords || [],
    notifications: notifications || [],
    isLoading: isLoadingAppointments || isLoadingRecords || isLoadingNotifications,
  };
};
