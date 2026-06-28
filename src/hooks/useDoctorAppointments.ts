import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { appointmentService } from '../services/appointment.service';
import type { AppointmentDto } from '../models/api.model';
import { useAuthStore } from '../store/auth.store';

export const APPT_KEYS = {
    all: ['doctor-appointments'] as const,
    today: ['doctor-appointments', 'today'] as const,
    waiting: ['doctor-appointments', 'waiting'] as const,
};

/** Toàn bộ lịch hẹn của bác sĩ */
export function useDoctorAppointments() {
    const { user } = useAuthStore();
    const doctorId = user?.doctorId || 0;
    return useQuery<AppointmentDto[], Error>({
        queryKey: [...APPT_KEYS.all, doctorId],
        queryFn: () => appointmentService.getByDoctor(doctorId),
        staleTime: 30_000,
    });
}

/** Lịch hẹn hôm nay */
export function useTodayAppointments() {
    const { user } = useAuthStore();
    const doctorId = user?.doctorId || 0;
    return useQuery<AppointmentDto[], Error>({
        queryKey: [...APPT_KEYS.today, doctorId],
        queryFn: () => appointmentService.getTodayAppointments(doctorId),
        staleTime: 30_000,
    });
}

/** Hàng đợi ưu tiên (Waiting List) */
export function useDoctorWaitingList(date: string) {
    const { user } = useAuthStore();
    const doctorId = user?.doctorId || 0;
    return useQuery<AppointmentDto[], Error>({
        queryKey: [...APPT_KEYS.waiting, doctorId, date],
        queryFn: () => appointmentService.getDoctorWaitingList(doctorId, date),
        staleTime: 10_000,
        refetchInterval: 10_000, // Tự động refetch mỗi 10s để cập nhật người mới đến
    });
}

/** Mutation: Xác nhận lịch hẹn */
export function useConfirmAppointment() {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (id) => appointmentService.confirm(id),
        onSuccess: () => {
            toast.success('Xác nhận lịch hẹn thành công!');
            qc.invalidateQueries({ queryKey: APPT_KEYS.all });
            qc.invalidateQueries({ queryKey: APPT_KEYS.today });
            qc.invalidateQueries({ queryKey: APPT_KEYS.waiting });
        },
        onError: (err) => toast.error(`Xác nhận thất bại: ${err.message}`),
    });
}

/** Mutation: Check-in lịch hẹn (Dành cho lễ tân) */
export function useCheckIn() {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (id) => appointmentService.checkIn(id),
        onSuccess: () => {
            toast.success('Check-in thành công! Bệnh nhân đã vào hàng đợi.');
            qc.invalidateQueries({ queryKey: APPT_KEYS.all });
            qc.invalidateQueries({ queryKey: APPT_KEYS.today });
            qc.invalidateQueries({ queryKey: APPT_KEYS.waiting });
            qc.invalidateQueries({ queryKey: ["allTodayAppointments"] });
        },
        onError: (err) => toast.error(`Check-in thất bại: ${err.message}`),
    });
}

/** Mutation: Hủy lịch hẹn */
export function useCancelAppointment() {
    const qc = useQueryClient();
    return useMutation<void, Error, { id: number; reason?: string }>({
        // reason is ignored by the service method, so we just pass id
        mutationFn: ({ id }) => appointmentService.cancel(id),
        onSuccess: () => {
            toast.success('Đã hủy lịch hẹn.');
            qc.invalidateQueries({ queryKey: APPT_KEYS.all });
            qc.invalidateQueries({ queryKey: APPT_KEYS.today });
            qc.invalidateQueries({ queryKey: APPT_KEYS.waiting });
        },
        onError: (err) => toast.error(`Hủy thất bại: ${err.message}`),
    });
}

/** Tính stats từ danh sách lịch hôm nay */
export function useDashboardStats(appointments?: AppointmentDto[]) {
    const list = appointments ?? [];
    return {
        todayTotal: list.length,
        todayConfirmed: list.filter((a) => a.status === 'Confirmed' || a.status === 'CheckedIn' || a.status === 'Examining').length,
        todayPending: list.filter((a) => a.status === 'Pending').length,
        todayCompleted: list.filter((a) => a.status === 'Completed').length,
    };
}

/** Mutation: Bắt đầu khám (Dành cho Bác sĩ) */
export function useStartExam() {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (id) => appointmentService.startExam(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: APPT_KEYS.all });
            qc.invalidateQueries({ queryKey: APPT_KEYS.today });
            qc.invalidateQueries({ queryKey: APPT_KEYS.waiting });
        },
        onError: (err) => toast.error(`Bắt đầu khám thất bại: ${err.message}`),
    });
}

/** Mutation: Lỡ hẹn (Dành cho Lễ tân) */
export function useMarkNoShow() {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (id) => appointmentService.markNoShow(id),
        onSuccess: () => {
            toast.success('Đã đánh dấu bệnh nhân lỡ hẹn.');
            qc.invalidateQueries({ queryKey: APPT_KEYS.all });
            qc.invalidateQueries({ queryKey: APPT_KEYS.today });
            qc.invalidateQueries({ queryKey: APPT_KEYS.waiting });
            qc.invalidateQueries({ queryKey: ["allTodayAppointments"] });
        },
        onError: (err) => toast.error(`Thao tác thất bại: ${err.message}`),
    });
}

/** Mutation: Dời lịch (Dành cho Lễ tân) */
export function useRescheduleAppointment() {
    const qc = useQueryClient();
    return useMutation<void, Error, { id: number; appointmentDate?: string; startTime?: string; timeSlotId?: number }>({
        mutationFn: ({ id, ...data }) => appointmentService.reschedule(id, data).then(() => {}),
        onSuccess: () => {
            toast.success('Dời lịch hẹn thành công!');
            qc.invalidateQueries({ queryKey: APPT_KEYS.all });
            qc.invalidateQueries({ queryKey: APPT_KEYS.today });
            qc.invalidateQueries({ queryKey: APPT_KEYS.waiting });
            qc.invalidateQueries({ queryKey: ["allTodayAppointments"] });
        },
        onError: (err) => toast.error(`Dời lịch thất bại: ${err.message}`),
    });
}

/** Mutation: Phân công bác sĩ (Dành cho Lễ tân) */
export function useAssignDoctor() {
    const qc = useQueryClient();
    return useMutation<void, Error, { id: number; doctorId: number; timeSlotId: number }>({
        mutationFn: ({ id, ...data }) => appointmentService.assignDoctor(id, data).then(() => {}),
        onSuccess: () => {
            toast.success('Đổi bác sĩ thành công!');
            qc.invalidateQueries({ queryKey: APPT_KEYS.all });
            qc.invalidateQueries({ queryKey: APPT_KEYS.today });
            qc.invalidateQueries({ queryKey: APPT_KEYS.waiting });
            qc.invalidateQueries({ queryKey: ["allTodayAppointments"] });
        },
        onError: (err) => toast.error(`Đổi bác sĩ thất bại: ${err.message}`),
    });
}