import React from 'react';
import { usePatientDashboard } from '../../hooks/usePatientDashboard';
import { StatCard } from '../../components/patient/StatCard';
import { Calendar, FileText, Bell, Plus, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const PatientDashboardPage: React.FC = () => {
  const { patient, appointments, medicalRecords, notifications, isLoading } = usePatientDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="p-8 max-w-6xl mx-auto animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-slate-200 rounded-xl"></div>
        <div className="h-32 bg-slate-200 rounded-xl"></div>
        <div className="h-32 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="h-64 bg-slate-200 rounded-xl"></div>
    </div>;
  }

  const upcomingAppointments = appointments.filter(a => ['Pending', 'Confirmed', 'Booked'].includes(a.status));
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Xin chào, {patient?.fullName || 'Bệnh nhân'}! 👋</h1>
          <p className="text-slate-500 mt-1">Chúc bạn một ngày tốt lành. Dưới đây là tổng quan sức khỏe của bạn.</p>
        </div>
        <Button asChild className="bg-[#15718E] hover:bg-[#115e76] gap-2">
          <Link to="/patient/book-appointment">
            <Plus className="w-4 h-4" />
            Đặt lịch mới
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Lịch hẹn sắp tới" 
          value={upcomingAppointments.length} 
          icon={<Calendar className="w-6 h-6" />}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
          description="Lịch hẹn chờ khám"
        />
        <StatCard 
          title="Hồ sơ khám bệnh" 
          value={medicalRecords.length} 
          icon={<FileText className="w-6 h-6" />}
          bgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          description="Lần khám tại phòng khám"
        />
        <StatCard 
          title="Thông báo mới" 
          value={unreadNotifications} 
          icon={<Bell className="w-6 h-6" />}
          bgColor="bg-amber-50"
          iconColor="text-amber-600"
          description="Thông báo chưa đọc"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Lịch hẹn gần nhất</h2>
          <Link to="/patient/records" className="text-[#15718E] hover:underline text-sm font-medium flex items-center">
            Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="p-0">
          {upcomingAppointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Bạn không có lịch hẹn nào sắp tới.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingAppointments.slice(0, 3).map((appt) => (
                <div key={appt.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#15718E] text-white p-3 rounded-lg text-center min-w-[70px]">
                      <div className="text-xs uppercase font-medium">{format(new Date(appt.slotDate), 'MMM')}</div>
                      <div className="text-xl font-bold">{format(new Date(appt.slotDate), 'dd')}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{appt.serviceName || 'Khám chuyên khoa'}</h3>
                      <p className="text-sm text-slate-500 mt-1">Bác sĩ: <span className="font-medium text-slate-700">{appt.doctorName || 'Chưa phân công'}</span></p>
                      <p className="text-sm text-slate-500">Thời gian: {appt.startTime.slice(0, 5)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/patient/appointments/${appt.id}`)}
                  >
                    Chi tiết
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
