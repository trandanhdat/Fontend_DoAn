import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Clock, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService } from '../../services/appointment.service';
import { appointmentService as apptApi } from '../../services/appointment.service'; // For loading slots
import { axiosInstance } from '../../utils/axios.config';

import { scheduleService } from '../../services/schedule.service';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, appointment }) => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    appointment?.slotDate?.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | undefined>(undefined);
  const [selectedStartTime, setSelectedStartTime] = useState<string>(appointment?.startTime?.substring(0, 5) || '08:00');

  // Lấy danh sách khung giờ nếu là lịch khám đích danh Bác sĩ
  const { data: timeSlots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ['availableSlots', appointment?.doctorId, selectedDate],
    queryFn: async () => {
      if (!appointment?.doctorId || !selectedDate) return [];
      return await scheduleService.getAvailableSlots(appointment.doctorId, selectedDate);
    },
    enabled: !!appointment?.doctorId && !!selectedDate,
  });

  const rescheduleMutation = useMutation({
    mutationFn: (data: any) => appointmentService.reschedule(appointment.id, data),
    onSuccess: () => {
      toast.success('Đổi lịch hẹn thành công! Trạng thái đã chuyển về Chờ duyệt.');
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi lịch.');
    }
  });

  if (!isOpen || !appointment) return null;

  const isDoctorAppointment = !!appointment.doctorId;

  const handleConfirm = () => {
    if (isDoctorAppointment) {
      if (!selectedTimeSlotId) {
        toast.error('Vui lòng chọn khung giờ khám mới.');
        return;
      }
      rescheduleMutation.mutate({ timeSlotId: selectedTimeSlotId });
    } else {
      rescheduleMutation.mutate({ appointmentDate: selectedDate, startTime: selectedStartTime });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Đổi Lịch Hẹn</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="bg-orange-50 text-orange-700 p-3 rounded-lg text-sm flex gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Sau khi đổi lịch, trạng thái sẽ chuyển về <b>Chờ duyệt</b> để chờ phòng khám xác nhận lại.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày khám mới</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTimeSlotId(undefined); // Reset slot khi đổi ngày
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15718E] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {isDoctorAppointment ? (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Khung giờ của BS. {appointment.doctorName}</label>
              {isLoadingSlots ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#15718E]"></div>
                </div>
              ) : timeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot: any) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTimeSlotId(slot.id)}
                      className={`py-2 text-sm font-medium rounded-lg border transition-all ${
                        selectedTimeSlotId === slot.id
                          ? 'bg-[#15718E] text-white border-[#15718E]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#15718E] hover:text-[#15718E]'
                      }`}
                    >
                      {slot.startTime.substring(0, 5)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                  Không có khung giờ trống nào trong ngày này. Vui lòng chọn ngày khác.
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Giờ khám dự kiến</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="time"
                  value={selectedStartTime}
                  onChange={(e) => setSelectedStartTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15718E] focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-white text-slate-700 font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleConfirm}
            disabled={rescheduleMutation.isPending || (isDoctorAppointment && !selectedTimeSlotId)}
            className="px-5 py-2.5 bg-[#15718E] text-white font-medium rounded-xl hover:bg-[#115b73] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {rescheduleMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Đổi lịch'}
          </button>
        </div>
      </div>
    </div>
  );
};
