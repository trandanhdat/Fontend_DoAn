import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    CalendarDays, CheckCircle2, Clock4, Users,
    RefreshCw, ChevronRight, Bell,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import {
    useTodayAppointments, useDoctorAppointments,
    useCancelAppointment, useDashboardStats,
    useDoctorWaitingList, useCheckIn, useStartExam,
} from '../../hooks/useDoctorAppointments';
import { useSignalR } from '../../hooks/useSignalR';
import { useAuthStore } from '../../store/auth.store';
import type { AppointmentDto, NotificationDto } from '../../models/api.model';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (t: string) => (t ?? '').slice(0, 5);

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
    Pending: { label: 'Chờ xác nhận', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    Confirmed: { label: 'Chưa đến', cls: 'bg-blue-100  text-blue-700  border-blue-200' },
    CheckedIn: { label: 'Đã đến', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Examining: { label: 'Đang khám', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    Completed: { label: 'Hoàn thành', cls: 'bg-slate-200 text-slate-700 border-slate-300' },
    Cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-600 border-red-200' },
    NoShow: { label: 'Lỡ hẹn', cls: 'bg-slate-200 text-slate-500 border-slate-300' },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CFG[status] ?? { label: status, cls: '' };
    return (
        <Badge variant="outline" className={`text-xs font-medium ${cfg.cls}`}>
            {cfg.label}
        </Badge>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
    title: string; value: number | string;
    icon: React.ReactNode; description?: string;
    accent: string; loading?: boolean;
}
function StatCard({ title, value, icon, description, accent, loading }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden border border-slate-100 shadow-sm bg-white">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />
            <CardContent className="pl-5 pr-4 py-4">
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-14" /><Skeleton className="h-3 w-32" />
                    </div>
                ) : (
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">{title}</p>
                            <p className="text-3xl font-bold text-slate-800 mt-1 tabular-nums">{value}</p>
                            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
                        </div>
                        <div className={`p-2.5 rounded-xl ${accent.replace('bg-', 'bg-').replace('-500', '-50').replace('-600', '- 50')}`}>
                            {icon}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}



// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DoctorDashboardPage() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();
    const todayLabel = format(new Date(), "EEEE, dd/MM/yyyy", { locale: vi });

    const [cancelTarget, setCancelTarget] = useState<AppointmentDto | null>(null);


    const { data: todayAppts, isLoading: loadingToday, isFetching: fetchingToday, refetch: refetchToday } = useTodayAppointments();
    const { data: allAppts, isLoading: loadingAll, isFetching: fetchingAll, refetch: refetchAll } = useDoctorAppointments();
    const stats = useDashboardStats(todayAppts);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const { data: waitingAppts, isLoading: loadingWaiting, isFetching: fetchingWaiting, refetch: refetchWaiting } = useDoctorWaitingList(todayStr);
    const checkInMutation = useCheckIn();

    const upcomingAppts = allAppts?.filter(a => a.slotDate > todayStr && a.status !== 'Cancelled' && a.status !== 'Completed')
        .sort((a, b) => a.slotDate.localeCompare(b.slotDate) || a.startTime.localeCompare(b.startTime))
        .slice(0, 5) || [];

    const cancelMutation = useCancelAppointment();
    const startExamMutation = useStartExam();

    const handleCancelConfirm = () => {
        if (!cancelTarget) return;
        cancelMutation.mutate(
            { id: cancelTarget.id, reason: 'Bác sĩ hủy lịch' },
            { onSettled: () => setCancelTarget(null) }
        );
    };

    return (
        <div className="min-h-screen bg-[#F4F7FA] p-5 space-y-5">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5 capitalize">{todayLabel}</p>
                </div>
                <div className="flex items-center gap-2">

                    <Button
                        variant="outline" size="sm"
                        className="gap-1.5 text-xs h-8"
                        onClick={() => { refetchToday(); refetchAll(); refetchWaiting(); }}
                        disabled={fetchingToday || fetchingAll || fetchingWaiting}
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${(fetchingToday || fetchingAll || fetchingWaiting) ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                    <Button asChild size="sm" className="h-8 bg-[#2E86AB] hover:bg-[#256d8c] text-xs gap-1.5">
                        <Link to="/doctor/appointments">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Tất cả lịch hẹn
                        </Link>
                    </Button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Lịch hẹn hôm nay" value={stats.todayTotal}
                    icon={<CalendarDays className="h-5 w-5 text-blue-600" />}
                    description="Tổng lịch trong ngày" accent="bg-blue-500" loading={loadingToday} />
                <StatCard title="Đã xác nhận" value={stats.todayConfirmed}
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    description="Lịch hẹn đã xác nhận" accent="bg-emerald-500" loading={loadingToday} />
                <StatCard title="Chờ xác nhận" value={stats.todayPending}
                    icon={<Clock4 className="h-5 w-5 text-amber-600" />}
                    description="Cần xử lý hôm nay" accent="bg-amber-500" loading={loadingToday} />
                <StatCard title="Hoàn thành" value={stats.todayCompleted}
                    icon={<Users className="h-5 w-5 text-violet-600" />}
                    description="Đã hoàn tất khám" accent="bg-violet-500" loading={loadingToday} />
            </div>

            {/* ── Timeline + Quick panel ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                {/* Lịch hôm nay */}
                <Card className="xl:col-span-2 border border-slate-100 shadow-sm bg-white">
                    <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 px-5 pt-4">
                        <CardTitle className="text-sm font-semibold text-slate-700">Lịch khám hôm nay</CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs text-[#2E86AB] h-7 px-2" asChild>
                            <Link to="/doctor/schedule">Xem lịch đầy đủ <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-0">
                        <ScrollArea className="h-[260px] pr-1">
                            {loadingToday ? (
                                <div className="space-y-2.5">
                                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                                </div>
                            ) : !todayAppts?.length ? (
                                <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                                    <CalendarDays className="h-9 w-9 opacity-25" />
                                    <p className="text-sm">Không có lịch hẹn nào hôm nay</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {todayAppts.map((appt) => (
                                        <div key={appt.id}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors">
                                            <div className="shrink-0 text-center w-14">
                                                <p className="text-xs font-bold text-[#2E86AB]">{fmtTime(appt.startTime)}</p>
                                                <p className="text-[10px] text-slate-400">{fmtTime(appt.endTime)}</p>
                                            </div>
                                            <div className="w-px h-7 bg-slate-200 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-700 truncate">{appt.patientName}</p>
                                                <p className="text-xs text-slate-400 truncate">{appt.serviceName}</p>
                                            </div>
                                            <StatusBadge status={appt.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Right panel */}
                <div className="space-y-5">
                    {/* Hàng đợi ưu tiên */}
                    <Card className="border border-slate-100 shadow-sm bg-white flex flex-col">
                        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 px-5 pt-4">
                            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Users className="h-4 w-4 text-emerald-600" />
                                Hàng đợi khám bệnh
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 pt-0">
                            <ScrollArea className="h-[200px] pr-1">
                                {loadingWaiting ? (
                                    <div className="space-y-2.5">
                                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                                    </div>
                                ) : !waitingAppts?.length ? (
                                    <div className="py-6 flex flex-col items-center text-slate-400 gap-2">
                                        <Users className="h-8 w-8 opacity-25" />
                                        <p className="text-sm text-center">Chưa có bệnh nhân chờ khám</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {waitingAppts.map((appt, idx) => (
                                            <div key={appt.id} className="flex gap-3 items-center p-2 rounded-lg border border-slate-100 bg-slate-50">
                                                <div className="font-bold text-lg text-slate-400 w-6 text-center">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-700 truncate">{appt.patientName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {appt.status === 'CheckedIn' ? (
                                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 hover:bg-emerald-100">Đã đến lúc {appt.checkInTime ? new Date(appt.checkInTime.endsWith('Z') ? appt.checkInTime : appt.checkInTime + 'Z').toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}</Badge>
                                                        ) : (
                                                            <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] px-1.5 hover:bg-slate-100">Chưa đến (Lịch: {fmtTime(appt.startTime)})</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    {appt.status === 'Confirmed' && (
                                                        <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-2" onClick={() => checkInMutation.mutate(appt.id)} disabled={checkInMutation.isPending}>
                                                            Check-in
                                                        </Button>
                                                    )}
                                                    {appt.status === 'CheckedIn' && (
                                                        <Button 
                                                            size="sm" 
                                                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 shadow-sm"
                                                            disabled={startExamMutation.isPending}
                                                            onClick={() => {
                                                                startExamMutation.mutate(appt.id, {
                                                                    onSuccess: () => navigate(`/doctor/records/create/${appt.id}`)
                                                                });
                                                            }}
                                                        >
                                                            Khám bệnh
                                                        </Button>
                                                    )}
                                                    {appt.status === 'Examining' && (
                                                        <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 shadow-sm" asChild>
                                                            <Link to={`/doctor/records/create/${appt.id}`}>
                                                                Đang khám...
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    {/* Lịch hẹn sắp tới */}
                    <Card className="border border-slate-100 shadow-sm bg-white flex flex-col">
                        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 px-5 pt-4">
                            <CardTitle className="text-sm font-semibold text-slate-700">Lịch hẹn sắp tới</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 pt-0">
                            {loadingAll ? (
                                <div className="space-y-2.5">
                                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                                </div>
                            ) : !upcomingAppts?.length ? (
                                <div className="py-6 flex flex-col items-center text-slate-400 gap-2">
                                    <CalendarDays className="h-8 w-8 opacity-25" />
                                    <p className="text-sm">Không có lịch sắp tới</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingAppts.map((appt) => (
                                        <div key={appt.id} className="flex gap-3 items-center">
                                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center w-14 shrink-0">
                                                <p className="text-[10px] text-slate-500 uppercase">{format(new Date(appt.slotDate), 'MMM')}</p>
                                                <p className="text-sm font-bold text-slate-700 leading-none">{format(new Date(appt.slotDate), 'dd')}</p>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-700 truncate">{appt.patientName}</p>
                                                <p className="text-xs text-slate-500 truncate">{fmtTime(appt.startTime)} - {appt.serviceName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>


                </div>
            </div>

            {/* ── Cancel dialog ── */}
            <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hủy lịch hẹn</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn hủy lịch hẹn của bệnh nhân{' '}
                            <span className="font-semibold text-slate-700">{cancelTarget?.patientName}</span>?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Quay lại</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleCancelConfirm}>
                            Xác nhận hủy
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
