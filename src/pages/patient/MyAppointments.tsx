import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { patientService } from '../../services/patient.service';
import { appointmentService } from '../../services/appointment.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock, Calendar as CalendarIcon, Filter, Stethoscope, Plus, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RescheduleModal } from '../../components/patient/RescheduleModal';

export const MyAppointments: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');

  // States cho Hủy Lịch
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // States cho Đổi lịch
  const [reschedulingAppt, setReschedulingAppt] = useState<any>(null);

  // States cho Xem Chi Tiết
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  const { data: patient } = useQuery({
    queryKey: ['patientMe'],
    queryFn: () => patientService.getMe(),
    enabled: !!user,
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['patientAppointments', patient?.id],
    queryFn: () => appointmentService.getPatientAppointments(patient!.id),
    enabled: !!patient?.id,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => appointmentService.cancelAppointment(id),
    onSuccess: () => {
      toast.success('Hủy lịch hẹn thành công');
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      setIsCancelModalOpen(false);
      setCancelingId(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi hủy lịch');
    }
  });

  const handleCancelClick = (id: number) => {
    setCancelingId(id);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (cancelingId) {
      cancelMutation.mutate(cancelingId);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'Upcoming') return apt.status === 'Pending' || apt.status === 'Booked' || apt.status === 'Confirmed';
    if (activeTab === 'Completed') return apt.status === 'Completed';
    if (activeTab === 'Cancelled') return apt.status === 'Cancelled';
    return true;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Lịch hẹn của tôi</h1>
        <p className="text-slate-500">Quản lý và theo dõi các cuộc hẹn y tế của bạn.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 mb-6 gap-4">
        <div className="flex gap-6 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('Upcoming')}
            className={`pb-3 whitespace-nowrap text-sm font-medium transition-colors relative ${activeTab === 'Upcoming' ? 'text-[#15718E]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sắp tới
            {activeTab === 'Upcoming' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#15718E] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('Completed')}
            className={`pb-3 whitespace-nowrap text-sm font-medium transition-colors relative ${activeTab === 'Completed' ? 'text-[#15718E]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Đã hoàn thành
            {activeTab === 'Completed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#15718E] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('Cancelled')}
            className={`pb-3 whitespace-nowrap text-sm font-medium transition-colors relative ${activeTab === 'Cancelled' ? 'text-[#15718E]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Đã hủy
            {activeTab === 'Cancelled' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#15718E] rounded-t-full" />}
          </button>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#15718E] mb-2 shrink-0">
          <Filter className="w-4 h-4" />
          Lọc kết quả
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15718E]"></div>
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:border-slate-300 transition-colors">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctorName || 'Doctor')}&background=f1f5f9&color=15718E`}
                  alt={apt.doctorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-base font-bold text-slate-800">BS. {apt.doctorName}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${apt.status === 'Confirmed' || apt.status === 'Booked' ? 'bg-blue-50 text-blue-600' :
                      apt.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                        apt.status === 'Completed' ? 'bg-green-50 text-green-600' :
                          'bg-red-50 text-red-600'
                    }`}>
                    {apt.status === 'Confirmed' || apt.status === 'Booked' ? '• Đã xác nhận' :
                      apt.status === 'Pending' ? '• Chờ xác nhận' :
                        apt.status === 'Completed' ? '• Hoàn thành' : '• Đã hủy'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    apt.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                    apt.paymentStatus === 'Failed' ? 'bg-red-50 text-red-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {apt.paymentStatus === 'Paid' ? '💳 Đã đặt cọc' :
                     apt.paymentStatus === 'Failed' ? '💳 Thanh toán lỗi' :
                     '💳 Chưa thanh toán'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{apt.startTime?.substring(0, 5) || ''} - {apt.slotDate ? format(new Date(apt.slotDate), 'EEEE, dd/MM/yyyy', { locale: vi }) : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-slate-400" />
                    <span>{apt.serviceName || 'Khám tổng quát'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">Phí khám</span>
                    <span>{apt.fee?.toLocaleString() || 0}đ</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-32 shrink-0 mt-4 sm:mt-0">
                <button
                  onClick={() => navigate(`/patient/appointments/${apt.id}`)}
                  className="flex-1 px-4 py-2 bg-white text-[#15718E] border border-[#15718E] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors text-center shadow-sm"
                >
                  Chi tiết
                </button>
                {(apt.status === 'Pending' || apt.status === 'Confirmed' || apt.status === 'Booked') && (
                  <>
                    <button
                      onClick={() => setReschedulingAppt(apt)}
                      className="flex-1 px-4 py-2 bg-white text-orange-600 border border-orange-200 text-sm font-medium rounded-lg hover:bg-orange-50 transition-colors text-center shadow-sm"
                    >
                      Đổi lịch
                    </button>
                    <button
                      onClick={() => handleCancelClick(apt.id)}
                      className="flex-1 px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors text-center shadow-sm"
                    >
                      Hủy lịch
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center mt-4">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-5 border border-slate-100">
              <Plus className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-6 text-lg">Bạn chưa có lịch hẹn nào ở đây</p>
            <button
              onClick={() => navigate('/patient/book')}
              className="px-6 py-2.5 bg-white text-[#15718E] border border-[#15718E] font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <CalendarIcon className="w-4 h-4" />
              Đặt lịch ngay
            </button>
          </div>
        )}
      </div>

      {/* Modal Hủy Lịch */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 text-red-600 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Xác nhận hủy lịch</h3>
              </div>
              <p className="text-slate-600 text-base mb-6 ml-16">
                Bạn có chắc chắn muốn hủy lịch hẹn này? Thao tác này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancelMutation.isPending}
                  className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {cancelMutation.isPending ? 'Đang xử lý...' : 'Đồng ý hủy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đổi lịch */}
      <RescheduleModal
        isOpen={!!reschedulingAppt}
        onClose={() => setReschedulingAppt(null)}
        appointment={reschedulingAppt}
      />
    </div>
  );
};
