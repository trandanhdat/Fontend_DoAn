import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Loader2, X, Clock } from "lucide-react";

import { scheduleService } from "../../services/schedule.service";
import { serviceService } from "../../services/service.service";
import { doctorService } from "../../services/doctor.service";
import { appointmentService } from "../../services/appointment.service";
import { useAuthStore } from "../../store/auth.store";

interface QuickBookModalProps {
  doctorId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickBookModal: React.FC<QuickBookModalProps> = ({ doctorId, isOpen, onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(null);
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  const { data: doctor } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => doctorService.getById(doctorId),
    enabled: !!doctorId && isOpen,
  });

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['doctorSchedules', doctorId],
    queryFn: () => scheduleService.getDoctorSchedules(doctorId),
    enabled: !!doctorId && isOpen,
  });

  const { data: realSlots = [], isLoading: loadingRealSlots } = useQuery({
    queryKey: ['realTimeslots', doctorId, selectedDate],
    queryFn: () => scheduleService.getAllSlots(doctorId, selectedDate),
    enabled: !!doctorId && isOpen && !!selectedDate,
  });

  const loadingSlots = loadingSchedules || loadingRealSlots;

  const allSlots = useMemo(() => {
    if (!schedules.length) return [];
    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 5 ngày kế tiếp có lịch làm việc của bác sĩ
    let addedDays = 0;
    let dayOffset = 0;

    // Giới hạn tìm kiếm tối đa 30 ngày để tránh infinite loop
    while (addedDays < 5 && dayOffset < 30) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);

      const dayOfWeek = currentDate.getDay(); // 0 là CN, 1-5 là T2-T6, 6 là T7

      const matchingSchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);

      // Nếu bác sĩ CÓ lịch vào ngày này (bất kể T7, CN hay ngày thường)
      if (matchingSchedules.length > 0) {
        for (const schedule of matchingSchedules) {
          const [startH, startM] = schedule.startTime.split(':').map(Number);
          const [endH, endM] = schedule.endTime.split(':').map(Number);

          let currentMins = startH * 60 + startM;
          const endMins = endH * 60 + endM;

          while (currentMins + schedule.slotDurationMinutes <= endMins) {
            const h = Math.floor(currentMins / 60);
            const m = currentMins % 60;
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;

            const slotDateFormatted = format(currentDate, "yyyy-MM-dd");
            // Check if there is a real slot in the DB
            const realSlot = realSlots.find(rs =>
              rs.slotDate.split('T')[0] === slotDateFormatted &&
              rs.startTime.substring(0, 5) === timeStr.substring(0, 5)
            );

            slots.push({
              id: realSlot ? realSlot.id : Math.random(), // Use real ID if exists
              doctorId: schedule.doctorId,
              slotDate: slotDateFormatted,
              startTime: timeStr,
              endTime: timeStr,
              status: realSlot ? realSlot.status : 'Available',
              isReal: !!realSlot
            });
            currentMins += schedule.slotDurationMinutes;
          }
        } // End for
        addedDays++;
      } // End if
      dayOffset++;
    } // End while
    return slots;
  }, [schedules, realSlots]);

  const dates = useMemo(() => {
    const uniqueDates = Array.from(new Set(allSlots.map(s => s.slotDate.split('T')[0])));
    uniqueDates.sort();
    return uniqueDates.map(dateStr => {
      const dateObj = new Date(dateStr);
      return {
        fullDate: dateStr,
        day: format(dateObj, "EEEE").replace("Monday", "Thứ 2").replace("Tuesday", "Thứ 3")
          .replace("Wednesday", "Thứ 4").replace("Thursday", "Thứ 5")
          .replace("Friday", "Thứ 6").replace("Saturday", "Thứ 7").replace("Sunday", "CN"),
        dateStr: format(dateObj, "dd-MM")
      };
    });
  }, [allSlots]);

  React.useEffect(() => {
    if (dates.length > 0 && (!selectedDate || !dates.find(d => d.fullDate === selectedDate))) {
      setSelectedDate(dates[0].fullDate);
    }
  }, [dates, selectedDate]);

  const { data: services = [] } = useQuery({
    queryKey: ['services', doctor?.specialtyId],
    queryFn: () => serviceService.getBySpecialty(doctor!.specialtyId),
    enabled: !!doctor?.specialtyId && isOpen,
  });

  const selectedService = services.find(s => s.id === selectedServiceId);
  const totalFee = (doctor?.consultationFee || 0) + (selectedService?.price || 0);

  const timeSlots = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const currentTimeStr = format(new Date(), "HH:mm:ss");
    
    return allSlots.filter(s => {
      if (s.slotDate !== selectedDate) return false;
      if (selectedDate === todayStr && s.startTime < currentTimeStr) return false;
      return true;
    });
  }, [allSlots, selectedDate]);

  const morningSlots = timeSlots.filter(s => {
    const hour = parseInt(s.startTime.split(':')[0]);
    return hour < 12;
  });

  const afternoonSlots = timeSlots.filter(s => {
    const hour = parseInt(s.startTime.split(':')[0]);
    return hour >= 12;
  });

  const bookMutation = useMutation({
    mutationFn: (timeSlotId: number) => {
      const patientId = user?.patientId || 0; // Sử dụng ID của patient đang đăng nhập  
      const selectedSlotObj = allSlots.find(s => s.id === timeSlotId);

      return appointmentService.bookAppointment({
        patientId,
        doctorId,
        timeSlotId,
        appointmentDate: selectedDate,
        startTime: selectedSlotObj?.startTime || "00:00:00",
        serviceId: selectedServiceId || undefined,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined
      });
    },
    onSuccess: () => {
      toast.success("Đặt lịch khám thành công!");
      onSuccess();
      onClose();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.");
    }
  });



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Đặt lịch khám nhanh</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Doctor Info */}
          {doctor && (
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=f1f5f9&color=15718E&size=150`}
                  alt={doctor.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{doctor.degree}, BS. {doctor.fullName}</h3>
                <p className="text-sm text-slate-500 mb-1">Chuyên khoa: {doctor.specialtyName}</p>
                <div className="text-sm font-medium text-orange-500">
                  Giá khám: {totalFee.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
          )}

          {/* Service Selection */}
          {services.length > 0 && (
            <div className="mb-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                <svg className="w-4 h-4 text-[#15718E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Dịch vụ khám
              </h4>
              <select 
                value={selectedServiceId || ''}
                onChange={(e) => setSelectedServiceId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] cursor-pointer hover:border-[#15718E]"
              >
                <option value="" className="bg-white text-slate-700">Chỉ khám tư vấn (Không chọn thêm dịch vụ)</option>
                {services.map(svc => (
                  <option key={svc.id} value={svc.id} className="bg-white text-slate-700">
                    {svc.name} (+{svc.price.toLocaleString('vi-VN')}đ)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dates */}
          <div className="mb-6">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <Clock className="w-4 h-4 text-[#15718E]" /> Chọn ngày khám
            </h4>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải lịch...
              </div>
            ) : dates.length > 0 ? (
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {dates.map((d, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(d.fullDate);
                      setSelectedTimeSlotId(null);
                    }}
                    className={`flex flex-col items-center justify-center py-3 px-1 sm:px-2 rounded-xl border transition-all ${selectedDate === d.fullDate
                      ? 'bg-[#15718E] border-[#15718E] text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-[#15718E] hover:text-[#15718E]'
                      }`}
                  >
                    <span className="text-xs font-semibold uppercase mb-1">{d.day}</span>
                    <span className="text-sm font-bold">{d.dateStr}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic py-3 bg-slate-50 rounded-lg px-4 border border-slate-100">
                Bác sĩ chưa có lịch làm việc.
              </div>
            )}
          </div>

          {/* Times */}
          {selectedDate && (
            <div className="space-y-4">
              {timeSlots.length === 0 ? (
                <div className="text-sm text-slate-500 italic py-3 text-center bg-slate-50 rounded-lg border border-slate-100">
                  Không có lịch trống trong ngày này.
                </div>
              ) : (
                <>
                  {/* Buổi Sáng */}
                  {morningSlots.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Buổi Sáng
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {morningSlots.map(slot => {
                          const isBooked = slot.status === 'Booked' || slot.status === 'Blocked';
                          const isDisabled = isBooked || !slot.isReal;
                          return (
                            <div key={slot.id} className="flex flex-col items-center">
                              <button
                                disabled={isDisabled}
                                onClick={() => setSelectedTimeSlotId(slot.id)}
                                className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${isDisabled
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                  : selectedTimeSlotId === slot.id
                                    ? 'bg-blue-50 border-2 border-[#15718E] text-[#15718E]'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#15718E] hover:text-[#15718E]'
                                  }`}
                              >
                                {slot.startTime.substring(0, 5)}
                              </button>
                              {isBooked && <span className="text-[10px] text-red-500 mt-1 font-medium">Đã đặt</span>}
                              {(!isBooked && !slot.isReal) && <span className="text-[10px] text-slate-400 mt-1 font-medium">Chưa mở</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Buổi Chiều */}
                  {afternoonSlots.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        Buổi Chiều
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {afternoonSlots.map(slot => {
                          const isBooked = slot.status === 'Booked' || slot.status === 'Blocked';
                          const isDisabled = isBooked || !slot.isReal;
                          return (
                            <div key={slot.id} className="flex flex-col items-center">
                              <button
                                disabled={isDisabled}
                                onClick={() => setSelectedTimeSlotId(slot.id)}
                                className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${isDisabled
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                  : selectedTimeSlotId === slot.id
                                    ? 'bg-blue-50 border-2 border-[#15718E] text-[#15718E]'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#15718E] hover:text-[#15718E]'
                                  }`}
                              >
                                {slot.startTime.substring(0, 5)}
                              </button>
                              {isBooked && <span className="text-[10px] text-red-500 mt-1 font-medium">Đã đặt</span>}
                              {(!isBooked && !slot.isReal) && <span className="text-[10px] text-slate-400 mt-1 font-medium">Chưa mở</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Reason and Notes Inputs */}
          {selectedTimeSlotId && (
            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lý do khám bệnh</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ví dụ: Đau đầu, chóng mặt..."
                  className="w-full px-3 py-2 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú thêm (Không bắt buộc)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Triệu chứng kéo dài bao lâu, đã uống thuốc gì chưa..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] resize-none"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={bookMutation.isPending}
            className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                toast.error("Vui lòng đăng nhập để đặt lịch.");
                return;
              }
              if (!selectedTimeSlotId) {
                toast.error("Vui lòng chọn giờ khám.");
                return;
              }

              const selectedSlotObj = allSlots.find(s => s.id === selectedTimeSlotId);

              if (!selectedSlotObj?.isReal) {
                toast.error("Lịch này chưa được tạo trong hệ thống. Vui lòng chọn lịch khác hoặc yêu cầu Admin tạo lịch.");
                return;
              }

              bookMutation.mutate(selectedTimeSlotId);
            }}
            disabled={!selectedTimeSlotId || bookMutation.isPending}
            className="px-6 py-2.5 rounded-lg font-bold text-white bg-[#15718E] hover:bg-[#105d76] disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
          >
            {bookMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
            ) : "Xác nhận đặt lịch"}
          </button>
        </div>

      </div>
    </div>
  );
};
