import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isToday, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    Search, CalendarDays, Filter, RefreshCw,
    AlertCircle, FilePlus, CheckCircle2, XCircle,
    Clock, User, Stethoscope, CreditCard,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

import {
    useDoctorAppointments,
    useConfirmAppointment,
    useCancelAppointment,
    useStartExam
} from '../../hooks/useDoctorAppointments';
import type { AppointmentDto } from '../../models/api.model';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (t: string) => (t ?? '').slice(0, 5);
const fmtDate = (d: string) => {
    try { return format(parseISO(d), 'dd/MM/yyyy', { locale: vi }); }
    catch { return d; }
};
const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// ─── Status config ────────────────────────────────────────────────────────────
type AppointmentStatus = 'Pending' | 'Confirmed' | 'CheckedIn' | 'Examining' | 'Completed' | 'Cancelled' | 'NoShow';

const STATUS_CFG: Record<AppointmentStatus, { label: string; cls: string; dotCls: string }> = {
    Pending: { label: 'Chờ xác nhận', cls: 'bg-amber-100 text-amber-700 border-amber-200', dotCls: 'bg-amber-400' },
    Confirmed: { label: 'Chưa đến', cls: 'bg-blue-100 text-blue-700 border-blue-200', dotCls: 'bg-blue-500' },
    CheckedIn: { label: 'Đã đến', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', dotCls: 'bg-emerald-500' },
    Examining: { label: 'Đang khám', cls: 'bg-purple-100 text-purple-700 border-purple-200', dotCls: 'bg-purple-500' },
    Completed: { label: 'Hoàn thành', cls: 'bg-slate-200 text-slate-700 border-slate-300', dotCls: 'bg-slate-500' },
    Cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-600 border-red-200', dotCls: 'bg-red-500' },
    NoShow: { label: 'Lỡ hẹn', cls: 'bg-slate-200 text-slate-500 border-slate-300', dotCls: 'bg-slate-400' },
};

const ALL_STATUSES = Object.keys(STATUS_CFG) as AppointmentStatus[];

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CFG[status as AppointmentStatus] ?? { label: status, cls: '', dotCls: 'bg-slate-400' };
    return (
        <Badge variant="outline" className={`text-xs font-medium gap-1.5 ${cfg.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotCls}`} />
            {cfg.label}
        </Badge>
    );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value, cls }: { label: string; value: number; cls: string }) {
    return (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${cls}`}>
            <span className="text-2xl font-bold tabular-nums">{value}</span>
            <span className="text-xs font-medium leading-tight max-w-[60px]">{label}</span>
        </div>
    );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
function AppointmentDetailModal({
    appt,
    open,
    onClose,
    onConfirm,
    onCancel,
    confirmPending,
    cancelPending,
}: {
    appt: AppointmentDto | null;
    open: boolean;
    onClose: () => void;
    onConfirm: (id: number) => void;
    onCancel: (appt: AppointmentDto) => void;
    confirmPending: boolean;
    cancelPending: boolean;
}) {
    const navigate = useNavigate();
    const startExamMutation = useStartExam();
    if (!appt) return null;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-base text-slate-800">Chi tiết lịch hẹn #{appt.id}</DialogTitle>
                    <DialogDescription className="sr-only">Thông tin chi tiết lịch hẹn</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-sm">
                    {/* Status */}
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-slate-500 text-xs">Trạng thái</span>
                        <StatusBadge status={appt.status} />
                    </div>

                    {/* Info rows */}
                    {[
                        { icon: <User className="h-3.5 w-3.5" />, label: 'Bệnh nhân', value: appt.patientName },
                        { icon: <Stethoscope className="h-3.5 w-3.5" />, label: 'Dịch vụ', value: appt.serviceName || 'Khám chuyên khoa' },
                        { icon: <CalendarDays className="h-3.5 w-3.5" />, label: 'Ngày khám', value: fmtDate(appt.slotDate) },
                        { icon: <Clock className="h-3.5 w-3.5" />, label: 'Giờ khám', value: `${fmtTime(appt.startTime)} – ${fmtTime(appt.endTime)}` },
                        { icon: <CreditCard className="h-3.5 w-3.5" />, label: 'Phí khám', value: fmtCurrency(appt.fee) },
                    ].map(({ icon, label, value }) => (
                        <div key={label} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-slate-500 text-xs w-24 shrink-0">
                                {icon}{label}
                            </div>
                            <span className="font-medium text-slate-700 text-right">{value}</span>
                        </div>
                    ))}

                    {appt.reason && (
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Lý do khám</p>
                            <p className="text-slate-700 text-sm bg-slate-50 rounded-lg px-3 py-2">{appt.reason}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    {appt.status === 'Pending' && (
                        <>
                            <Button
                                className="flex-1 bg-[#2E86AB] hover:bg-[#256d8c] text-sm h-9 gap-1.5"
                                onClick={() => { onConfirm(appt.id); onClose(); }}
                                disabled={confirmPending}
                            >
                                <CheckCircle2 className="h-4 w-4" /> Xác nhận
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-red-200 text-red-500 hover:bg-red-50 text-sm h-9 gap-1.5"
                                onClick={() => { onCancel(appt); onClose(); }}
                                disabled={cancelPending}
                            >
                                <XCircle className="h-4 w-4" /> Hủy lịch
                            </Button>
                        </>
                    )}
                    {appt.status === 'Confirmed' && (
                        <>
                            <Button
                                variant="outline"
                                className="flex-1 border-red-200 text-red-500 hover:bg-red-50 h-9 gap-1.5"
                                onClick={() => { onCancel(appt); onClose(); }}
                                disabled={cancelPending}
                            >
                                <XCircle className="h-4 w-4" /> Hủy lịch
                            </Button>
                        </>
                    )}
                    {appt.status === 'CheckedIn' && (
                        <>
                            <Button 
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm h-9 gap-1.5 text-white" 
                                disabled={startExamMutation.isPending}
                                onClick={() => {
                                    startExamMutation.mutate(appt.id, {
                                        onSuccess: () => navigate(`/doctor/records/create/${appt.id}`)
                                    });
                                }}
                            >
                                <FilePlus className="h-4 w-4" /> Khám bệnh
                            </Button>
                        </>
                    )}
                    {appt.status === 'Examining' && (
                        <>
                            <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-sm h-9 gap-1.5 text-white" asChild>
                                <Link to={`/doctor/records/create/${appt.id}`}>
                                    <FilePlus className="h-4 w-4" /> Đang khám...
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Table skeleton ───────────────────────────────────────────────────────────
function TableSkeleton() {
    return (
        <>
            {Array.from({ length: 7 }).map((_, i) => (
                <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DoctorAppointmentsPage() {
    const navigate = useNavigate();
    // Filters
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');
    const [filterDate, setFilterDate] = useState('');

    // Dialogs
    const [detailAppt, setDetailAppt] = useState<AppointmentDto | null>(null);
    const [cancelTarget, setCancelTarget] = useState<AppointmentDto | null>(null);

    // Data
    const { data: appointments = [], isLoading, isFetching, refetch } = useDoctorAppointments();
    const confirmMutation = useConfirmAppointment();
    const cancelMutation = useCancelAppointment();
    const startExamMutation = useStartExam();

    // ── Stats ──
    const stats = useMemo(() => ({
        total: appointments.length,
        pending: appointments.filter((a) => a.status === 'Pending').length,
        confirmed: appointments.filter((a) => a.status === 'Confirmed').length,
        completed: appointments.filter((a) => a.status === 'Completed').length,
        cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
    }), [appointments]);

    // ── Filtered list ──
    const filtered = useMemo(() => {
        return appointments.filter((a) => {
            const matchSearch = !search ||
                a.patientName.toLowerCase().includes(search.toLowerCase()) ||
                a.serviceName.toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === 'all' || a.status === filterStatus;
            const matchDate = !filterDate || a.slotDate === filterDate;
            return matchSearch && matchStatus && matchDate;
        });
    }, [appointments, search, filterStatus, filterDate]);

    // Pagination
    const [pageIndex, setPageIndex] = useState(1);
    const pageSize = 8;
    
    // Group by date
    const grouped = useMemo(() => {
        const startIndex = (pageIndex - 1) * pageSize;
        const paginated = filtered.slice(startIndex, startIndex + pageSize);

        const map = new Map<string, AppointmentDto[]>();
        paginated.forEach((a) => {
            const key = a.slotDate;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(a);
        });
        // Sort dates descending
        return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
    }, [filtered, pageIndex, pageSize]);

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;

    // Reset pagination when filters change
    useMemo(() => {
        setPageIndex(1);
    }, [search, filterStatus, filterDate]);

    const handleCancelConfirm = () => {
        if (!cancelTarget) return;
        cancelMutation.mutate(
            { id: cancelTarget.id, reason: 'Bác sĩ hủy lịch' },
            { onSettled: () => setCancelTarget(null) }
        );
    };

    const clearFilters = () => {
        setSearch(''); setFilterStatus('all'); setFilterDate('');
    };
    const hasFilters = search || filterStatus !== 'all' || filterDate;

    return (
        <div className="min-h-screen bg-[#F4F7FA] p-5 space-y-5">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý lịch hẹn</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Theo dõi và xử lý toàn bộ lịch hẹn của bạn
                    </p>
                </div>
                <Button
                    variant="outline" size="sm" className="h-8 gap-1.5 text-xs self-start sm:self-auto"
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>

            {/* ── Stats bar ── */}
            <div className="flex flex-wrap gap-2">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-32 rounded-xl" />)
                ) : (
                    <>
                        <StatPill label="Tổng lịch" value={stats.total} cls="bg-white border-slate-200 text-slate-700" />
                        <StatPill label="Chờ xác nhận" value={stats.pending} cls="bg-amber-50 border-amber-200 text-amber-700" />
                        <StatPill label="Đã xác nhận" value={stats.confirmed} cls="bg-blue-50 border-blue-200 text-blue-700" />
                        <StatPill label="Hoàn thành" value={stats.completed} cls="bg-emerald-50 border-emerald-200 text-emerald-700" />
                        <StatPill label="Đã hủy" value={stats.cancelled} cls="bg-red-50 border-red-200 text-red-600" />
                    </>
                )}
            </div>

            {/* ── Filters ── */}
            <Card className="border border-slate-100 shadow-sm bg-white">
                <CardContent className="px-5 py-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm bệnh nhân hoặc dịch vụ..."
                                className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Status filter */}
                        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as AppointmentStatus | 'all')}>
                            <SelectTrigger className="h-9 w-44 text-sm bg-slate-50 border-slate-200 shrink-0">
                                <Filter className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                {ALL_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>{STATUS_CFG[s].label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Date filter */}
                        <input
                            type="date"
                            className="h-9 text-sm px-3 rounded-md border border-slate-200 bg-slate-50 text-slate-700 shrink-0
                         focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/30 focus:border-[#2E86AB]"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />

                        {/* Clear */}
                        {hasFilters && (
                            <Button
                                variant="ghost" size="sm"
                                className="text-xs text-slate-400 hover:text-slate-600 h-9 shrink-0"
                                onClick={clearFilters}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>

                    {/* Active filter chips */}
                    {hasFilters && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {search && (
                                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                                    Tìm: "{search}"
                                </span>
                            )}
                            {filterStatus !== 'all' && (
                                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                                    {STATUS_CFG[filterStatus].label}
                                </span>
                            )}
                            {filterDate && (
                                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                                    Ngày: {fmtDate(filterDate)}
                                </span>
                            )}
                            <span className="text-xs text-slate-400 px-2 py-0.5">
                                {filtered.length} kết quả
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Table ── */}
            <Card className="border border-slate-100 shadow-sm bg-white">
                <CardHeader className="pb-0 px-5 pt-4 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                        Danh sách lịch hẹn
                    </CardTitle>
                    <span className="text-xs text-slate-400">
                        {filtered.length} / {appointments.length} lịch hẹn
                    </span>
                </CardHeader>
                <CardContent className="px-4 pt-3 pb-4">
                    <ScrollArea className="h-[580px]">
                        {isLoading ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                        {['Bệnh nhân', 'Dịch vụ', 'Ngày khám', 'Giờ khám', 'Phí', 'Trạng thái', 'Thao tác'].map((h) => (
                                            <TableHead key={h} className="text-xs font-semibold text-slate-500">{h}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody><TableSkeleton /></TableBody>
                            </Table>
                        ) : !filtered.length ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                                <AlertCircle className="h-10 w-10 opacity-20" />
                                <div className="text-center">
                                    <p className="text-sm font-medium">Không tìm thấy lịch hẹn nào</p>
                                    {hasFilters && (
                                        <p className="text-xs mt-1">
                                            Thử{' '}
                                            <button className="text-[#2E86AB] underline" onClick={clearFilters}>
                                                xóa bộ lọc
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Grouped by date */
                            <div className="space-y-1">
                                {grouped.map(([date, appts]) => {
                                    const parsedDate = parseISO(date);
                                    const isTodayDate = isToday(parsedDate);
                                    return (
                                        <div key={date}>
                                            {/* Date separator */}
                                            <div className="flex items-center gap-2 py-2 px-2 sticky top-0 bg-white z-10">
                                                <span className={`text-xs font-semibold ${isTodayDate ? 'text-[#2E86AB]' : 'text-slate-500'}`}>
                                                    {isTodayDate ? 'Hôm nay – ' : ''}{fmtDate(date)}
                                                </span>
                                                <div className="flex-1 h-px bg-slate-100" />
                                                <span className="text-xs text-slate-400">{appts.length} lịch</span>
                                            </div>

                                            <Table>
                                                {/* Header chỉ render ở nhóm đầu */}
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50/80 hover:bg-slate-50">
                                                        {['Bệnh nhân', 'Dịch vụ', 'Giờ khám', 'Phí', 'Trạng thái', 'Thao tác'].map((h) => (
                                                            <TableHead key={h} className="text-xs font-semibold text-slate-500 h-8">{h}</TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {appts.map((appt) => (
                                                        <TableRow
                                                            key={appt.id}
                                                            className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                                                            onClick={() => setDetailAppt(appt)}
                                                        >
                                                            {/* Bệnh nhân */}
                                                            <TableCell className="py-3">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="h-7 w-7 rounded-full bg-[#2E86AB]/10 flex items-center justify-center shrink-0">
                                                                        <span className="text-xs font-bold text-[#2E86AB]">
                                                                            {appt.patientName.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-medium text-slate-700 max-w-[140px] truncate">
                                                                        {appt.patientName}
                                                                    </span>
                                                                </div>
                                                            </TableCell>

                                                            {/* Dịch vụ */}
                                                            <TableCell className="text-sm text-slate-500 max-w-[160px]">
                                                                <span className="truncate block">{appt.serviceName || 'Khám chuyên khoa'}</span>
                                                            </TableCell>

                                                            {/* Giờ */}
                                                            <TableCell className="text-sm text-slate-600 tabular-nums whitespace-nowrap">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                                    {fmtTime(appt.startTime)} – {fmtTime(appt.endTime)}
                                                                </div>
                                                            </TableCell>

                                                            {/* Phí */}
                                                            <TableCell className="text-sm font-medium text-slate-700 tabular-nums whitespace-nowrap">
                                                                {fmtCurrency(appt.fee)}
                                                            </TableCell>

                                                            {/* Trạng thái */}
                                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                                <StatusBadge status={appt.status} />
                                                            </TableCell>

                                                            {/* Thao tác */}
                                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                                <div className="flex items-center gap-1.5">
                                                                    {appt.status === 'Pending' && (
                                                                        <>
                                                                            <Button
                                                                                size="sm" variant="outline"
                                                                                className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 px-2.5"
                                                                                onClick={() => confirmMutation.mutate(appt.id)}
                                                                                disabled={confirmMutation.isPending}
                                                                            >
                                                                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                                                Xác nhận
                                                                            </Button>
                                                                            <Button
                                                                                size="sm" variant="outline"
                                                                                className="h-7 text-xs border-red-200 text-red-500 hover:bg-red-50 px-2"
                                                                                onClick={() => setCancelTarget(appt)}
                                                                                disabled={cancelMutation.isPending}
                                                                            >
                                                                                <XCircle className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </>
                                                                    )}

                                                                    {appt.status === 'Confirmed' && (
                                                                        <>
                                                                            <Button
                                                                                size="sm" variant="outline"
                                                                                className="h-7 text-xs border-red-200 text-red-500 hover:bg-red-50 px-2"
                                                                                onClick={() => setCancelTarget(appt)}
                                                                                disabled={cancelMutation.isPending}
                                                                            >
                                                                                <XCircle className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </>
                                                                    )}

                                                                    {appt.status === 'CheckedIn' && (
                                                                        <>
                                                                            <Button
                                                                                size="sm" variant="outline"
                                                                                className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 px-2.5"
                                                                                disabled={startExamMutation.isPending}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    startExamMutation.mutate(appt.id, {
                                                                                        onSuccess: () => navigate(`/doctor/records/create/${appt.id}`)
                                                                                    });
                                                                                }}
                                                                            >
                                                                                <FilePlus className="h-3.5 w-3.5 mr-1" />
                                                                                Khám bệnh
                                                                            </Button>
                                                                        </>
                                                                    )}

                                                                    {appt.status === 'Examining' && (
                                                                        <>
                                                                            <Button
                                                                                size="sm" variant="outline"
                                                                                className="h-7 text-xs border-purple-200 text-purple-600 hover:bg-purple-50 px-2.5"
                                                                                asChild
                                                                            >
                                                                                <Link to={`/doctor/records/create/${appt.id}`}>
                                                                                    <FilePlus className="h-3.5 w-3.5 mr-1" />
                                                                                    Đang khám...
                                                                                </Link>
                                                                            </Button>
                                                                        </>
                                                                    )}

                                                                    {(appt.status === 'Completed' || appt.status === 'Cancelled' || appt.status === 'NoShow') && (
                                                                        <Button
                                                                            size="sm" variant="ghost"
                                                                            className="h-7 text-xs text-slate-400 hover:text-slate-600 px-2.5"
                                                                            onClick={() => setDetailAppt(appt)}
                                                                        >
                                                                            Chi tiết
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Pagination Controls */}
                    {filtered.length > pageSize && (
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                            <span className="text-sm text-slate-500">
                                Hiển thị {(pageIndex - 1) * pageSize + 1} - {Math.min(pageIndex * pageSize, filtered.length)} của {filtered.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline" size="sm" className="h-8"
                                    onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                                    disabled={pageIndex === 1}
                                >
                                    Trang trước
                                </Button>
                                <span className="text-sm font-medium text-slate-700 px-2">
                                    {pageIndex} / {totalPages}
                                </span>
                                <Button
                                    variant="outline" size="sm" className="h-8"
                                    onClick={() => setPageIndex(p => Math.min(totalPages, p + 1))}
                                    disabled={pageIndex === totalPages}
                                >
                                    Trang sau
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Detail Modal ── */}
            <AppointmentDetailModal
                appt={detailAppt}
                open={!!detailAppt}
                onClose={() => setDetailAppt(null)}
                onConfirm={(id) => confirmMutation.mutate(id)}
                onCancel={(appt) => setCancelTarget(appt)}
                confirmPending={confirmMutation.isPending}
                cancelPending={cancelMutation.isPending}
            />

            {/* ── Cancel Dialog ── */}
            <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hủy lịch hẹn</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn hủy lịch hẹn của bệnh nhân{' '}
                            <span className="font-semibold text-slate-700">{cancelTarget?.patientName}</span>{' '}
                            lúc{' '}
                            <span className="font-semibold text-slate-700">
                                {cancelTarget ? fmtTime(cancelTarget.startTime) : ''} ngày {cancelTarget ? fmtDate(cancelTarget.slotDate) : ''}
                            </span>?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Quay lại</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={handleCancelConfirm}
                            disabled={cancelMutation.isPending}
                        >
                            {cancelMutation.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}