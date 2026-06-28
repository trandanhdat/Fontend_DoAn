import React, { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { 
  BadgeCheck, MapPin, User, Briefcase, MessageSquare, 
  Calendar as CalendarIcon, Star, Info, Loader2, Clock, CheckCircle2, AlertCircle
} from "lucide-react";

import { doctorService } from "../../services/doctor.service";
import { ReviewList } from "../../components/doctor/ReviewList";
import { serviceService } from "../../services/service.service";
import { reviewService } from "../../services/review.service";
import { scheduleService } from "../../services/schedule.service";
import { patientService } from "../../services/patient.service";
import { appointmentService } from "../../services/appointment.service";
import { useAuthStore } from "../../store/auth.store";

import { BookingConfirmationModal } from "../../components/appointment/BookingConfirmationModal";

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const doctorId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sinh danh sách 4 ngày tới
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(null);

  // Queries
  const { data: doctor, isLoading: loadingDoctor } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => doctorService.getById(doctorId),
    enabled: !!doctorId,
  });

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['services', doctor?.specialtyId],
    queryFn: () => serviceService.getBySpecialty(doctor!.specialtyId),
    enabled: !!doctor?.specialtyId,
  });

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['doctorSchedules', doctorId],
    queryFn: () => scheduleService.getDoctorSchedules(doctorId),
    enabled: !!doctorId,
  });

  const { data: realSlots = [], isLoading: loadingRealSlots } = useQuery({
    queryKey: ['realTimeslots', doctorId, selectedDate],
    queryFn: () => scheduleService.getAllSlots(doctorId, selectedDate),
    enabled: !!doctorId && !!selectedDate,
  });

  const loadingSlots = loadingSchedules || loadingRealSlots;

  const allSlots = useMemo(() => {
    if (!schedules.length) return [];
    const slots: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let addedDays = 0;
    let dayOffset = 0;
    
    while (addedDays < 5) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      
      const dayOfWeek = currentDate.getDay(); 
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const matchingSchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);
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
            const realSlot = realSlots.find(rs => 
              rs.slotDate.split('T')[0] === slotDateFormatted && 
              rs.startTime.substring(0, 5) === timeStr.substring(0, 5)
            );

            slots.push({
               id: realSlot ? realSlot.id : Math.random(),
               doctorId: schedule.doctorId,
               slotDate: slotDateFormatted,
               startTime: timeStr,
               endTime: timeStr, 
               status: realSlot ? realSlot.status : 'Available',
               isReal: !!realSlot
            });
            currentMins += schedule.slotDurationMinutes;
          }
        }
        addedDays++;
      }
      dayOffset++;
    }
    return slots;
  }, [schedules, realSlots]);

  const dates = useMemo(() => {
    const uniqueDates = Array.from(new Set(allSlots.map(s => s.slotDate.split('T')[0])));
    uniqueDates.sort();
    return uniqueDates.map(dateStr => {
      const dateObj = new Date(dateStr);
      return {
        fullDate: dateStr,
        day: format(dateObj, "EEEE").replace("Monday", "Th 2").replace("Tuesday", "Th 3")
          .replace("Wednesday", "Th 4").replace("Thursday", "Th 5")
          .replace("Friday", "Th 6").replace("Saturday", "Th 7").replace("Sunday", "CN"),
        dateStr: format(dateObj, "dd")
      };
    });
  }, [allSlots]);

  // Initialize selectedDate once dates are generated
  React.useEffect(() => {
    if (dates.length > 0 && (!selectedDate || !dates.find(d => d.fullDate === selectedDate))) {
      setSelectedDate(dates[0].fullDate);
    }
  }, [dates, selectedDate]);

  // Filter slots for the selected date
  const timeSlots = useMemo(() => {
    return allSlots.filter(s => s.slotDate.split('T')[0] === selectedDate);
  }, [allSlots, selectedDate]);


  const selectedSlot = timeSlots.find(s => s.id === selectedTimeSlotId);
  const defaultService = services.length > 0 ? services[0] : null;

  const bookMutation = useMutation({
    mutationFn: async ({ reason, notes, serviceId }: { reason: string, notes: string, serviceId: number | null }) => {
      // Get patient details from the backend
      const patient = await patientService.getMe();
      
      return appointmentService.bookAppointment({
        patientId: patient.id,
        doctorId: doctorId,
        timeSlotId: selectedTimeSlotId!,
        serviceId: serviceId || undefined,
        appointmentDate: selectedDate,
        startTime: selectedSlot?.startTime || "00:00:00",
        reason: reason || undefined,
        notes: notes || undefined
      });
    },
    onSuccess: () => {
      toast.success("Đặt lịch khám thành công!");
      setIsModalOpen(false);
      navigate("/patient/records");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch.";
      toast.error(msg);
    }
  });

  if (loadingDoctor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#15718E] animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy thông tin bác sĩ.</div>;
  }

  const handleBookClick = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đặt lịch khám.");
      navigate("/login");
      return;
    }
    
    if (user?.roles && !user.roles.includes("Patient")) {
      toast.error("Chỉ tài khoản Bệnh nhân mới có thể đặt lịch.");
      return;
    }

    if (!selectedSlot?.isReal) {
      toast.error("Lịch này chưa được tạo trong hệ thống. Vui lòng chọn lịch khác hoặc yêu cầu Admin tạo lịch.");
      return;
    }

    setIsModalOpen(true);
  };

  // Tách slots Sáng/Chiều
  const morningSlots = timeSlots.filter(s => parseInt(s.startTime.split(':')[0]) < 12);
  const afternoonSlots = timeSlots.filter(s => parseInt(s.startTime.split(':')[0]) >= 12);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Top Section: Doctor Info & Fee */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Doctor Info Card */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row gap-6 shadow-sm">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
            {doctor.avatarUrl ? (
              <img src={doctor.avatarUrl} alt={doctor.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                 <User className="w-16 h-16 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full w-max mb-3">
              {doctor.experienceYears}+ năm kinh nghiệm
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{doctor.degree}, Bác sĩ {doctor.fullName}</h1>
            <p className="text-slate-600 font-medium mb-4">Chuyên khoa: {doctor.specialtyName}</p>
            
            <div className="flex items-center gap-4 text-sm text-slate-500">
              {doctor.isActive && (
                <div className="flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                  <span>Đã xác thực</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Hệ thống MedClinical</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Fee Card */}
        <div className="w-full md:w-72 bg-[#f0f7ff] rounded-xl border border-blue-100 p-6 flex flex-col items-center justify-center shadow-sm shrink-0">
          <h3 className="text-slate-600 font-medium mb-2 uppercase text-xs tracking-wider">Phí tư vấn</h3>
          <div className="text-3xl font-bold text-[#15718E] mb-2">{doctor.consultationFee.toLocaleString('vi-VN')}đ</div>
          <p className="text-sm text-slate-500 italic">Mỗi lượt khám</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column (Wider) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Giới thiệu */}
          {doctor.bio && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-[#15718E]" />
                <h2 className="text-lg font-bold text-[#15718E]">Giới thiệu</h2>
              </div>
              <div className="p-6 text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                {doctor.bio}
              </div>
            </div>
          )}

          {/* Dịch vụ & Bảng giá */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#15718E]" />
              <h2 className="text-lg font-bold text-[#15718E]">Dịch vụ & Bảng giá chuyên khoa</h2>
            </div>
            <div className="p-0">
              {loadingServices ? (
                <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : services.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium">Dịch vụ</th>
                      <th className="text-left py-3 px-6 font-medium hidden sm:table-cell">Thời gian</th>
                      <th className="text-right py-3 px-6 font-medium">Giá tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {services.map(svc => (
                      <tr key={svc.id}>
                        <td className="py-4 px-6">{svc.name}</td>
                        <td className="py-4 px-6 hidden sm:table-cell">{svc.durationMinutes} phút</td>
                        <td className="py-4 px-6 text-right font-bold">{svc.price.toLocaleString('vi-VN')}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">Chưa có dịch vụ nào.</div>
              )}
            </div>
          </div>

          {/* Đánh giá từ bệnh nhân */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#15718E]" />
                <h2 className="text-lg font-bold text-[#15718E]">Đánh giá từ bệnh nhân</h2>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-md">
                <Star className="w-4 h-4 fill-[#15718E] text-[#15718E]" />
                <span className="font-bold text-[#15718E]">{doctor.averageRating ?? 5.0}</span>
                <span className="text-xs text-slate-500">({doctor.totalReviews ?? 0} đánh giá)</span>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50/30">
              <ReviewList doctorId={Number(id)} />
            </div>
          </div>
        </div>

        {/* Right Column (Narrower) */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          
          {/* Chọn lịch khám */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Chọn lịch khám</h3>
            
            {/* Date Picker */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {dates.length > 0 ? dates.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(d.fullDate);
                    setSelectedTimeSlotId(null); // Reset time when changing date
                  }}
                  className={`flex flex-col items-center justify-center min-w-[70px] py-3 px-2 rounded-xl border transition-all ${
                    selectedDate === d.fullDate 
                      ? 'bg-[#15718E] border-[#15718E] text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-[#15718E] hover:text-[#15718E]'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase mb-1">{d.day}</span>
                  <span className="text-xl font-bold">{d.dateStr}</span>
                </button>
              )) : (
                <div className="text-sm text-slate-500 italic py-2">Bác sĩ chưa có lịch làm việc.</div>
              )}
            </div>

            {/* Time Slots */}
            {loadingSlots ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : timeSlots.length > 0 ? (
              <>
                {morningSlots.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-slate-500 mb-3">Sáng</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {morningSlots.map((slot) => {
                        const isBooked = slot.status !== 'Available';
                        const isDisabled = isBooked || !slot.isReal;
                        return (
                          <div key={slot.id} className="flex flex-col items-center">
                            <button 
                              disabled={isDisabled}
                              onClick={() => !isDisabled && setSelectedTimeSlotId(slot.id)}
                              className={`w-full py-2 rounded border text-sm font-medium transition-colors ${
                                isDisabled 
                                  ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed'
                                  : selectedTimeSlotId === slot.id
                                    ? 'bg-[#15718E] text-white border-[#15718E]'
                                    : 'bg-white text-[#15718E] border-[#15718E] hover:bg-blue-50'
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

                {afternoonSlots.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-slate-500 mb-3">Chiều</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {afternoonSlots.map((slot) => {
                        const isBooked = slot.status !== 'Available';
                        const isDisabled = isBooked || !slot.isReal;
                        return (
                          <div key={slot.id} className="flex flex-col items-center">
                            <button 
                              disabled={isDisabled}
                              onClick={() => !isDisabled && setSelectedTimeSlotId(slot.id)}
                              className={`w-full py-2 rounded border text-sm font-medium transition-colors ${
                                isDisabled 
                                  ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed'
                                  : selectedTimeSlotId === slot.id
                                    ? 'bg-[#15718E] text-white border-[#15718E]'
                                    : 'bg-white text-[#15718E] border-[#15718E] hover:bg-blue-50'
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
            ) : (
              <div className="text-center text-slate-500 text-sm mb-6">Không có lịch trống trong ngày này.</div>
            )}

            <button 
              disabled={!selectedTimeSlotId}
              onClick={handleBookClick}
              className={`w-full py-3 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors ${
                selectedTimeSlotId 
                  ? 'bg-[#15718E] hover:bg-[#105d76] text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              Đặt lịch khám
            </button>
            {!isAuthenticated && (
              <div className="flex items-center justify-center gap-1 mt-3 text-xs text-slate-400">
                <Info className="w-3 h-3" />
                <span>Yêu cầu đăng nhập để tiếp tục</span>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="border-t border-slate-200 mt-8 pt-8 pb-4 flex flex-col md:flex-row justify-between text-sm text-slate-500">
        <div className="mb-4 md:mb-0 max-w-xs">
          <div className="font-bold text-[#15718E] text-lg mb-2">MedClinical</div>
          <p>Giải pháp quản lý y tế và kết nối bác sĩ hàng đầu tại Việt Nam. Tin cậy - Chuyên nghiệp - Tận tâm.</p>
        </div>
        <div className="mb-4 md:mb-0">
          <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs">Liên kết nhanh</h4>
          <ul className="flex flex-col gap-2">
            <li><Link to="#" className="hover:text-[#15718E]">Quy trình khám bệnh</Link></li>
            <li><Link to="#" className="hover:text-[#15718E]">Chính sách bảo mật</Link></li>
            <li><Link to="#" className="hover:text-[#15718E]">Hỗ trợ khách hàng</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs">Bản quyền</h4>
          <p>© 2024 MedClinical Systems. All rights reserved.</p>
          <div className="flex gap-4 mt-4">
            <div className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:border-[#15718E] cursor-pointer"><BadgeCheck className="w-4 h-4"/></div>
            <div className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:border-[#15718E] cursor-pointer"><MessageSquare className="w-4 h-4"/></div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {selectedSlot && (
        <BookingConfirmationModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={(reason, notes, serviceId) => bookMutation.mutate({ reason, notes, serviceId })}
          isPending={bookMutation.isPending}
          
          doctorName={`${doctor.degree}, Bác sĩ ${doctor.fullName}`}
          specialtyName={doctor.specialtyName}
          experienceYears={doctor.experienceYears}
          
          services={services}
          consultationFee={doctor.consultationFee}
          appointmentDate={selectedDate}
          startTime={selectedSlot.startTime}
          endTime={selectedSlot.endTime}
        />
      )}
    </div>
  );
};
