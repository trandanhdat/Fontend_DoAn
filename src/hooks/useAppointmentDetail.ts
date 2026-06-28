import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';
import { medicalRecordService } from '../services/medical-record.service';
import { reviewService } from '../services/review.service';

export const useAppointmentDetail = (appointmentId?: number) => {
  const { data: appointment, isLoading: isLoadingAppt } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentService.getById(appointmentId!),
    enabled: !!appointmentId,
  });

  const { data: medicalRecord, isLoading: isLoadingRecord } = useQuery({
    queryKey: ['medicalRecordByAppointment', appointmentId],
    queryFn: () => medicalRecordService.getRecordByAppointment(appointmentId!),
    enabled: !!appointmentId && appointment?.status === 'Completed',
    retry: false, // In case there's no medical record yet
  });

  const { data: review, isLoading: isLoadingReview } = useQuery({
    queryKey: ['reviews', 'appointment', appointmentId],
    queryFn: () => reviewService.getByAppointment(appointmentId!),
    enabled: !!appointmentId && appointment?.status === 'Completed',
    retry: false,
  });

  return {
    appointment,
    medicalRecord,
    review,
    isLoading: isLoadingAppt || isLoadingRecord || isLoadingReview,
  };
};
