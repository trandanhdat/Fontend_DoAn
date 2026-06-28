import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { scheduleService } from '../services/schedule.service';
import type { DoctorScheduleDto, TimeSlotDto, CreateScheduleDto } from '../models/api.model';

export const SCHEDULE_KEYS = {
    byDoctor: (doctorId: number) => ['schedules', doctorId] as const,
    slotsByDate: (doctorId: number, date: string) => ['slots', doctorId, date] as const,
};

/** Lấy toàn bộ lịch làm việc của bác sĩ */
export function useDoctorSchedules(doctorId: number | undefined) {
    return useQuery<DoctorScheduleDto[], Error>({
        queryKey: SCHEDULE_KEYS.byDoctor(doctorId ?? 0),
        queryFn: () => scheduleService.getByDoctor(doctorId!),
        enabled: !!doctorId,
        staleTime: 60_000,
    });
}

/** Lấy TimeSlot theo ngày */
export function useTimeSlotsByDate(doctorId: number | undefined, date: string) {
    return useQuery<TimeSlotDto[], Error>({
        queryKey: SCHEDULE_KEYS.slotsByDate(doctorId ?? 0, date),
        queryFn: () => scheduleService.getAllSlots(doctorId!, date),
        enabled: !!doctorId && !!date,
        staleTime: 30_000,
    });
}

/** Mutation: Tạo lịch làm việc mới */
export function useCreateSchedule() {
    const qc = useQueryClient();
    return useMutation<DoctorScheduleDto, Error, CreateScheduleDto>({
        mutationFn: scheduleService.create,
        onSuccess: (_data, vars) => {
            toast.success('Lưu lịch làm việc thành công!');
            qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.byDoctor(vars.doctorId) });
        },
        onError: (err) => toast.error(`Lưu thất bại: ${err.message}`),
    });
}

/** Mutation: Khóa một slot */
export function useBlockSlot(doctorId: number, date: string) {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: scheduleService.blockSlot,
        onSuccess: () => {
            toast.success('Đã khóa khung giờ.');
            qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.slotsByDate(doctorId, date) });
        },
        onError: (err) => toast.error(`Khóa slot thất bại: ${err.message}`),
    });
}

/** Mutation: Mở khóa một slot */
export function useUnblockSlot(doctorId: number, date: string) {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: scheduleService.unblockSlot,
        onSuccess: () => {
            toast.success('Đã mở khóa khung giờ.');
            qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.slotsByDate(doctorId, date) });
        },
        onError: (err) => toast.error(`Mở khóa thất bại: ${err.message}`),
    });
}