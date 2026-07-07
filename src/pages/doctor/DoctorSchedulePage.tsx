import { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Lock, Unlock, CalendarDays, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
    useDoctorSchedules, useTimeSlotsByDate,
    useCreateSchedule, useBlockSlot, useUnblockSlot, useDeleteSchedule
} from '../../hooks/useDoctorSchedule';
import { useAuthStore } from '../../store/auth.store';
import type { DoctorScheduleDto, TimeSlotDto } from '../../models/api.model';

// ─── Constants ────────────────────────────────────────────────────────────────
/** 0=CN, 1=T2 … 6=T7 */
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DAY_FULL = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

// ─── Slot status config ───────────────────────────────────────────────────────
const SLOT_CFG: Record<string, { label: string; cls: string; dotCls: string }> = {
    Available: { label: 'Trống', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200', dotCls: 'bg-emerald-500' },
    Booked: { label: 'Có lịch', cls: 'bg-red-100    text-red-600    border-red-200    cursor-default', dotCls: 'bg-red-500' },
    Blocked: { label: 'Đã khóa', cls: 'bg-slate-100  text-slate-400  border-slate-200  cursor-default', dotCls: 'bg-slate-400' },
};

// ─── Zod schema ───────────────────────────────────────────────────────────────
const scheduleSchema = z.object({
    dayOfWeek: z.coerce.number().min(0).max(6),
    startTime: z.string().min(1, 'Chọn giờ bắt đầu'),
    endTime: z.string().min(1, 'Chọn giờ kết thúc'),
    slotDurationMinutes: z.coerce.number().min(15, 'Tối thiểu 15 phút').max(120),
}).refine((d) => d.startTime < d.endTime, {
    message: 'Giờ kết thúc phải sau giờ bắt đầu',
    path: ['endTime'],
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

// ─── Week header ──────────────────────────────────────────────────────────────
interface WeekHeaderProps {
    weekStart: Date;
    schedules: DoctorScheduleDto[];
    selectedDay: Date;
    onSelectDay: (d: Date) => void;
}

function WeekHeader({ weekStart, schedules, selectedDay, onSelectDay }: WeekHeaderProps) {
    // Ngày trong tuần: T2 (1) … CN (0) → sắp xếp T2 trước
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // dayOfWeek set từ schedules
    const activeDays = new Set(schedules.map((s) => s.dayOfWeek));

    return (
        <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
                const dow = day.getDay(); // 0=CN
                const isToday = isSameDay(day, new Date());
                const isSel = isSameDay(day, selectedDay);
                const hasWork = activeDays.has(dow);
                const sch = schedules.find((s) => s.dayOfWeek === dow);

                return (
                    <button
                        key={day.toISOString()}
                        onClick={() => onSelectDay(day)}
                        className={[
                            'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all',
                            isSel ? 'bg-[#2E86AB] text-white border-[#2E86AB] shadow-md' :
                                isToday ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    hasWork ? 'bg-white text-slate-700 border-slate-200 hover:border-[#2E86AB] hover:text-[#2E86AB]' :
                                        'bg-slate-50 text-slate-400 border-slate-100',
                        ].join(' ')}
                    >
                        <span className="font-bold">{DAY_LABELS[dow]}</span>
                        <span className={`text-lg font-bold ${isSel ? 'text-white' : ''}`}>
                            {format(day, 'd')}
                        </span>
                        {hasWork ? (
                            <span className={`text-[10px] ${isSel ? 'text-blue-100' : 'text-slate-400'}`}>
                                {sch ? `${sch.startTime.slice(0, 5)} – ${sch.endTime.slice(0, 5)}` : ''}
                            </span>
                        ) : (
                            <span className={`text-[10px] ${isSel ? 'text-blue-100' : 'text-slate-400'}`}>Nghỉ</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Time slot grid ───────────────────────────────────────────────────────────
interface SlotGridProps {
    slots: TimeSlotDto[];
    loading: boolean;
    onBlockSlot: (slot: TimeSlotDto) => void;
    onUnblockSlot: (slot: TimeSlotDto) => void;
    blockingId: number | null;
    selectedDate: Date;
}

function SlotGrid({ slots, loading, onBlockSlot, onUnblockSlot, blockingId, selectedDate }: SlotGridProps) {
    const dateLabel = format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi });

    if (loading) {
        return (
            <div className="grid grid-cols-4 gap-2 mt-3">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
            </div>
        );
    }

    if (!slots.length) {
        return (
            <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
                <CalendarDays className="h-9 w-9 opacity-25" />
                <p className="text-sm">Không có khung giờ nào cho ngày này</p>
            </div>
        );
    }

    // Group by break time (khoảng cách > 30 phút)
    return (
        <div className="mt-3">
            <p className="text-xs text-slate-400 mb-2 capitalize">{dateLabel}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-2">
                {slots.map((slot) => {
                    const cfg = SLOT_CFG[slot.status] ?? SLOT_CFG.Available;
                    const isBlocking = blockingId === slot.id;
                    const canBlock = slot.status === 'Available';

                    return (
                        <div
                            key={slot.id}
                            className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-3 rounded-xl border text-xs font-medium transition-all ${cfg.cls}`}
                        >
                            <span className="font-bold">{slot.startTime.slice(0, 5)}</span>
                            <span className="text-[10px] opacity-70">{slot.endTime.slice(0, 5)}</span>
                            {/* Status badge */}
                            {slot.status !== 'Available' && (
                                <span className={`mt-1 text-[10px] px-1.5 py-0.5 rounded-full ${slot.status === 'Booked' ? 'bg-red-200 text-red-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {cfg.label}
                                </span>
                            )}
                            {/* Lock button */}
                            {canBlock && (
                                <button
                                    onClick={() => onBlockSlot(slot)}
                                    disabled={isBlocking}
                                    className="absolute top-1 right-1 p-0.5 rounded text-emerald-400 hover:text-emerald-600 hover:bg-emerald-200 transition-colors"
                                    title="Khóa slot này"
                                >
                                    <Lock className="h-3 w-3" />
                                </button>
                            )}
                            {/* Unblock button */}
                            {slot.status === 'Blocked' && (
                                <button
                                    onClick={() => onUnblockSlot(slot)}
                                    disabled={isBlocking}
                                    className="absolute top-1 right-1 p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                                    title="Mở khóa slot này"
                                >
                                    <Unlock className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DoctorSchedulePage() {
    const { user } = useAuthStore();
    const doctorId = user?.doctorId || 0;

    // Week navigation
    const [weekStart, setWeekStart] = useState<Date>(() => {
        // Bắt đầu tuần từ Thứ 2
        const mon = startOfWeek(new Date(), { weekStartsOn: 1 });
        return mon;
    });

    // Selected day for slot detail
    const [selectedDay, setSelectedDay] = useState<Date>(new Date());

    // Slot block confirmation
    const [blockTarget, setBlockTarget] = useState<TimeSlotDto | null>(null);
    const [blockingId, setBlockingId] = useState<number | null>(null);

    const selectedDateStr = format(selectedDay, 'yyyy-MM-dd');

    // Data
    const { data: schedules = [], isLoading: loadingSchedules } = useDoctorSchedules(doctorId);
    const { data: slots = [], isLoading: loadingSlots } = useTimeSlotsByDate(doctorId, selectedDateStr);

    const createMutation = useCreateSchedule();
    const deleteMutation = useDeleteSchedule();
    const blockMutation = useBlockSlot(doctorId ?? 0, selectedDateStr);
    const unblockMutation = useUnblockSlot(doctorId ?? 0, selectedDateStr);

    // Form
    const form = useForm<ScheduleFormValues>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            dayOfWeek: selectedDay.getDay(),
            startTime: '08:00',
            endTime: '17:00',
            slotDurationMinutes: 30,
        },
    });

    // Đồng bộ Ngày đang chọn trên Header xuống Form Ngày trong tuần
    useEffect(() => {
        form.setValue('dayOfWeek', selectedDay.getDay());
    }, [selectedDay, form]);

    const onSubmit = (values: ScheduleFormValues) => {
        if (!doctorId) return;
        createMutation.mutate({
            doctorId,
            dayOfWeek: values.dayOfWeek,
            startTime: values.startTime + ':00',
            endTime: values.endTime + ':00',
            slotDurationMinutes: values.slotDurationMinutes,
        });
    };

    const handleBlockConfirm = () => {
        if (!blockTarget) return;
        setBlockingId(blockTarget.id);
        blockMutation.mutate(blockTarget.id, {
            onSettled: () => { setBlockTarget(null); setBlockingId(null); },
        });
    };

    // Slot legend
    const slotCounts = useMemo(() => ({
        available: slots.filter((s) => s.status === 'Available').length,
        booked: slots.filter((s) => s.status === 'Booked').length,
        blocked: slots.filter((s) => s.status === 'Blocked').length,
    }), [slots]);

    const weekLabel = `${format(weekStart, 'dd/MM')} – ${format(addDays(weekStart, 6), 'dd/MM/yyyy')}`;

    return (
        <div className="min-h-screen bg-[#F4F7FA] p-5 space-y-5">

            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Lịch làm việc</h1>
                <p className="text-sm text-slate-500 mt-0.5">Quản lý lịch và khung giờ khám của bạn</p>
            </div>

            {/* ── Week navigation ── */}
            <Card className="border border-slate-100 shadow-sm bg-white">
                <CardHeader className="pb-3 px-5 pt-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-slate-700">
                            Lịch làm việc tuần này
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-7 w-7"
                                onClick={() => setWeekStart((d) => subWeeks(d, 1))}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs font-medium text-slate-600 w-36 text-center">{weekLabel}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7"
                                onClick={() => setWeekStart((d) => addWeeks(d, 1))}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    {loadingSchedules ? (
                        <div className="grid grid-cols-7 gap-1.5">
                            {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                        </div>
                    ) : (
                        <WeekHeader
                            weekStart={weekStart}
                            schedules={schedules}
                            selectedDay={selectedDay}
                            onSelectDay={setSelectedDay}
                        />
                    )}
                </CardContent>
            </Card>

            {/* ── Bottom 2 columns: Config + Slot detail ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* Config form */}
                <Card className="lg:col-span-2 border border-slate-100 shadow-sm bg-white">
                    <CardHeader className="pb-2 px-5 pt-4">
                        <CardTitle className="text-sm font-semibold text-slate-700">Cấu hình lịch</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-5">

                        {/* Danh sách các ca đã cấu hình */}
                        {schedules.filter(s => s.dayOfWeek === form.watch('dayOfWeek')).length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Các ca làm việc hiện tại</h4>
                                <div className="space-y-2">
                                    {schedules.filter(s => s.dayOfWeek === form.watch('dayOfWeek')).map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                                            <div className="text-sm font-medium text-slate-700">
                                                {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)} <span className="text-xs text-slate-400 font-normal ml-1">({s.slotDurationMinutes} phút/slot)</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    if (confirm('Bạn có chắc muốn xóa ca làm việc này không? Các slot trống sẽ bị xóa, slot đã có khách đặt sẽ được giữ lại.')) {
                                                        deleteMutation.mutate({ scheduleId: s.id, doctorId });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Thêm ca làm việc mới</h4>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    {/* Ngày trong tuần */}
                                    <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-slate-600">Ngày trong tuần</FormLabel>
                                            <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 text-sm">
                                                        <SelectValue placeholder="Chọn thứ" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {DAY_FULL.map((label, idx) => (
                                                        <SelectItem key={idx} value={String(idx)}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )} />

                                    {/* Giờ bắt đầu / kết thúc */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField control={form.control} name="startTime" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs text-slate-600">Giờ bắt đầu</FormLabel>
                                                <FormControl>
                                                    <Input type="time" className="h-9 text-sm" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="endTime" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs text-slate-600">Giờ kết thúc</FormLabel>
                                                <FormControl>
                                                    <Input type="time" className="h-9 text-sm" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )} />
                                    </div>

                                    {/* Thời lượng slot */}
                                    <FormField control={form.control} name="slotDurationMinutes" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-slate-600">Thời lượng slot (phút)</FormLabel>
                                            <div className="flex gap-2">
                                                {[15, 30, 45, 60].map((min) => (
                                                    <button
                                                        key={min} type="button"
                                                        onClick={() => field.onChange(min)}
                                                        className={[
                                                            'flex-1 h-9 rounded-lg border text-sm font-medium transition-all',
                                                            field.value === min
                                                                ? 'bg-[#2E86AB] text-white border-[#2E86AB]'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#2E86AB] hover:text-[#2E86AB]',
                                                        ].join(' ')}
                                                    >
                                                        {min}
                                                    </button>
                                                ))}
                                            </div>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )} />

                                    <Button
                                        type="submit"
                                        className="w-full bg-[#2E86AB] hover:bg-[#256d8c] h-9"
                                        disabled={createMutation.isPending}
                                    >
                                        {createMutation.isPending ? 'Đang thêm...' : 'Thêm ca làm việc mới'}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </CardContent>
                </Card>

                {/* Slot detail */}
                <Card className="lg:col-span-3 border border-slate-100 shadow-sm bg-white">
                    <CardHeader className="pb-2 px-5 pt-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold text-slate-700">
                                    Chi tiết khung giờ
                                </CardTitle>
                                <p className="text-xs text-slate-400 mt-0.5 capitalize">
                                    {format(selectedDay, 'EEEE, dd/MM', { locale: vi })}
                                </p>
                            </div>
                            {/* Legend */}
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                                    Trống ({slotCounts.available})
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
                                    Có lịch ({slotCounts.booked})
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block" />
                                    Khóa ({slotCounts.blocked})
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <ScrollArea className="h-[380px] pr-1">
                            <SlotGrid
                                slots={slots}
                                loading={loadingSlots}
                                onBlockSlot={setBlockTarget}
                                onUnblockSlot={(slot) => {
                                    setBlockingId(slot.id);
                                    unblockMutation.mutate(slot.id, {
                                        onSettled: () => setBlockingId(null),
                                    });
                                }}
                                blockingId={blockingId}
                                selectedDate={selectedDay}
                            />
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* ── Block dialog ── */}
            <AlertDialog open={!!blockTarget} onOpenChange={(o) => !o && setBlockTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-800 text-xl">Xác nhận khóa khung giờ</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 text-base mt-2">
                            Bạn muốn khóa slot{' '}
                            <span className="font-semibold text-slate-800">
                                {blockTarget?.startTime.slice(0, 5)} – {blockTarget?.endTime.slice(0, 5)}
                            </span>{' '}
                            ngày <span className="font-semibold text-slate-800">{format(selectedDay, 'dd/MM/yyyy')}</span>?
                            Slot sẽ không thể đặt lịch sau khi khóa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction className="bg-slate-700 hover:bg-slate-800" onClick={handleBlockConfirm}>
                            Xác nhận khóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}