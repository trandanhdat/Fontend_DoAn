import React, { useMemo } from 'react';
import { 
  Users, Stethoscope, CalendarCheck, TrendingUp,
  Star, Clock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';

import { 
  useAdminDashboardStats, 
  useAdminDashboardChart, 
  useAdminDashboardTopDoctors 
} from '../../hooks/useAdminDashboard';

// Custom formatter cho tiền tệ VNĐ
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Xanh lá (Hoàn thành), Cam (Chờ), Đỏ (Hủy)

export default function AdminDashboardPage() {
  const { data: stats, isLoading: loadingStats } = useAdminDashboardStats();
  const { data: chartData, isLoading: loadingChart } = useAdminDashboardChart(30);
  const { data: topDoctors, isLoading: loadingDoctors } = useAdminDashboardTopDoctors(5);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Hoàn thành', value: stats.totalCompleted },
      { name: 'Sắp tới', value: stats.upcomingAppointments },
      { name: 'Đã hủy', value: stats.totalCancelled },
    ];
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-sm text-slate-500 mt-1">Theo dõi các chỉ số quan trọng của phòng khám</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Tổng Bác sĩ" 
          value={stats?.totalDoctors} 
          icon={<Stethoscope className="w-5 h-5 text-blue-600" />} 
          loading={loadingStats}
          trend="+2 trong tháng này"
        />
        <StatCard 
          title="Tổng Bệnh nhân" 
          value={stats?.totalPatients} 
          icon={<Users className="w-5 h-5 text-indigo-600" />} 
          loading={loadingStats}
          trend="+15% so với tháng trước"
        />
        <StatCard 
          title="Lịch khám đã HT" 
          value={stats?.totalCompleted} 
          icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />} 
          loading={loadingStats}
          trend={`Tỷ lệ hủy: ${stats?.cancellationRate ?? 0}%`}
        />
        <StatCard 
          title="Doanh thu" 
          value={stats ? formatCurrency(stats.totalRevenue) : undefined} 
          icon={<TrendingUp className="w-5 h-5 text-amber-600" />} 
          loading={loadingStats}
          trend="Tăng trưởng ổn định"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lịch hẹn theo ngày */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-700">Lịch hẹn 30 ngày qua</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingChart ? (
              <div className="h-[300px] flex items-center justify-center"><Skeleton className="h-full w-full" /></div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${d.getDate()}/${d.getMonth()+1}`;
                      }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(val) => new Date(val).toLocaleDateString('vi-VN')}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tỷ lệ trạng thái */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-700">Tỷ lệ Trạng thái Lịch hẹn</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="h-[300px] flex items-center justify-center"><Skeleton className="h-[200px] w-[200px] rounded-full" /></div>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Doctors Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-700">Top Bác sĩ Nổi bật (Đánh giá cao nhất)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[300px]">Bác sĩ</TableHead>
                <TableHead>Chuyên khoa</TableHead>
                <TableHead className="text-right">Đánh giá</TableHead>
                <TableHead className="text-right">Tổng lịch khám</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingDoctors ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-[50px] ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-[50px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : topDoctors?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-slate-500">Chưa có dữ liệu bác sĩ</TableCell>
                </TableRow>
              ) : (
                topDoctors?.map((doc) => (
                  <TableRow key={doc.doctorId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                          {doc.avatarUrl ? (
                            <img src={doc.avatarUrl} alt={doc.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold">
                              {doc.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{doc.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {doc.specialtyName || 'Chưa cập nhật'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-bold text-amber-500">{doc.averageRating.toFixed(1)}</span>
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-xs text-slate-400">({doc.reviewCount})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-700">
                      {doc.totalAppointments}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Component Phụ ──────────────────────────────────────────────────────────

function StatCard({ 
  title, value, icon, loading, trend 
}: { 
  title: string, value: string | number | undefined, icon: React.ReactNode, loading: boolean, trend: string 
}) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mb-1" />
            ) : (
              <h3 className="text-2xl font-bold text-slate-800">{value !== undefined ? value : '--'}</h3>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}
