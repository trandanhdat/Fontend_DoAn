import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Stethoscope, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { useSpecialties } from '../../hooks/usePublicData';
import { useServicesBySpecialty } from '../../hooks/useServices';
import { useAuthStore } from '../../store/auth.store';
import { appointmentService } from '../../services/appointment.service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { patientService } from '../../services/patient.service';
import toast from 'react-hot-toast';

export const GeneralBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: specialties, isLoading: isLoadingSpecialties } = useSpecialties();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSession, setSelectedSession] = useState<'morning' | 'afternoon' | null>(null);
  const [reason, setReason] = useState<string>('');
  
  const { data: services, isLoading: isLoadingServices } = useServicesBySpecialty(selectedSpecialtyId || 0);

  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['specialty-availability', selectedSpecialtyId, selectedDate],
    queryFn: () => appointmentService.checkSpecialtyAvailability(selectedSpecialtyId!, format(selectedDate!, 'yyyy-MM-dd')),
    enabled: !!selectedSpecialtyId && !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Vui lòng đăng nhập");
      if (!selectedSpecialtyId) throw new Error("Chưa chọn chuyên khoa");
      if (!selectedDate) throw new Error("Chưa chọn ngày khám");
      if (!selectedSession) throw new Error("Chưa chọn buổi khám");

      const patient = await patientService.getMe();
      const startTime = selectedSession === 'morning' ? '08:00:00' : '13:00:00';
      
      return appointmentService.bookAppointment({
        patientId: patient.id,
        specialtyId: selectedSpecialtyId,
        serviceId: selectedServiceId || undefined,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: startTime,
        reason: reason || undefined
      });
    },
    onSuccess: (data: any) => {
      const timeStr = data?.startTime ? data.startTime.substring(0, 5) : '';
      const docStr = data?.doctorName ? ` với Bác sĩ ${data.doctorName}` : '';
      
      toast.success(`Hệ thống đã tự động phân công! Bạn được xếp lịch khám vào lúc ${timeStr}${docStr}.`, {
        duration: 5000,
      });
      navigate('/patient/appointments');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Đã xảy ra lỗi khi đặt lịch");
    }
  });

  const handleNextStep = () => {
    if (step === 1 && selectedSpecialtyId) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3 && selectedDate && selectedSession) setStep(4);
  };

  const handleSubmit = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt lịch khám");
      navigate('/login', { state: { from: '/book-general' } });
      return;
    }
    bookMutation.mutate();
  };

  const selectedSpecialty = specialties?.find(s => s.id === selectedSpecialtyId);
  const selectedService = services?.find(s => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Suggestion Banner */}
          <div className="bg-amber-50 border-b border-amber-100 p-4 text-center text-amber-800 text-sm">
            Bạn muốn chọn đích danh bác sĩ điều trị? <button onClick={() => navigate('/doctors')} className="font-bold underline hover:text-amber-600 transition-colors">Xem danh sách Bác sĩ tại đây</button>
          </div>

          {/* Header */}
          <div className="bg-[#2E86AB] p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Đặt lịch khám theo Chuyên khoa</h1>
            <p className="text-blue-100">Bệnh viện sẽ tự động sắp xếp bác sĩ trực cho bạn khi đến khám.</p>
          </div>

          {/* Progress Bar */}
          <div className="flex border-b border-slate-100">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${
                  step === i ? 'text-[#2E86AB] border-b-2 border-[#2E86AB]' : 
                  step > i ? 'text-green-600' : 'text-slate-400'
                }`}
              >
                {i === 1 && '1. Chuyên khoa'}
                {i === 2 && '2. Dịch vụ (Tùy chọn)'}
                {i === 3 && '3. Ngày khám'}
                {i === 4 && '4. Xác nhận'}
              </div>
            ))}
          </div>

          <div className="p-8 min-h-[400px]">
            {/* Step 1: Specialty */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-[#2E86AB]" />
                  Bạn muốn khám chuyên khoa nào?
                </h2>
                {isLoadingSpecialties ? (
                  <p className="text-slate-500">Đang tải danh sách chuyên khoa...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specialties?.map(spec => (
                      <div 
                        key={spec.id}
                        onClick={() => setSelectedSpecialtyId(spec.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedSpecialtyId === spec.id 
                            ? 'border-[#2E86AB] bg-blue-50' 
                            : 'border-slate-100 hover:border-blue-200'
                        }`}
                      >
                        <h3 className="font-semibold text-slate-800">{spec.name}</h3>
                        {spec.description && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{spec.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleNextStep}
                    disabled={!selectedSpecialtyId}
                    className="px-8 py-3 bg-[#2E86AB] text-white rounded-xl font-medium hover:bg-[#2E86AB]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Tiếp tục <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Service */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-slate-800">
                  Chọn Dịch vụ cụ thể (Tùy chọn)
                </h2>
                <p className="text-slate-500">Nếu bạn muốn thực hiện một dịch vụ cụ thể thuộc khoa {selectedSpecialty?.name}, hãy chọn dưới đây. Hoặc bỏ qua nếu chỉ muốn khám chung.</p>
                
                {isLoadingServices ? (
                  <p className="text-slate-500">Đang tải danh sách dịch vụ...</p>
                ) : services && services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        onClick={() => setSelectedServiceId(null)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedServiceId === null 
                            ? 'border-[#2E86AB] bg-blue-50' 
                            : 'border-slate-100 hover:border-blue-200'
                        }`}
                      >
                        <h3 className="font-semibold text-slate-800">Khám chung (Không chọn dịch vụ cụ thể)</h3>
                    </div>
                    {services.map(srv => (
                      <div 
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedServiceId === srv.id 
                            ? 'border-[#2E86AB] bg-blue-50' 
                            : 'border-slate-100 hover:border-blue-200'
                        }`}
                      >
                        <h3 className="font-semibold text-slate-800">{srv.name}</h3>
                        <p className="text-sm font-medium text-orange-600 mt-1">{srv.price.toLocaleString('vi-VN')} đ</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-slate-500 italic">
                    Không có dịch vụ cụ thể nào cho chuyên khoa này. Bạn có thể tiếp tục.
                  </div>
                )}
                
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                  >
                    Quay lại
                  </button>
                  <button 
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-[#2E86AB] text-white rounded-xl font-medium hover:bg-[#2E86AB]/90 flex items-center gap-2"
                  >
                    Tiếp tục <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Date */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-[#2E86AB]" />
                  Chọn Ngày khám
                </h2>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Calendar */}
                  <div className="flex-1 flex justify-center border border-slate-200 rounded-2xl p-4 bg-white">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={vi}
                      disabled={{ before: new Date() }}
                      modifiersClassNames={{
                        selected: "bg-[#2E86AB] text-white hover:bg-[#2E86AB]/90",
                        today: "font-bold text-[#2E86AB]"
                      }}
                      className="mx-auto"
                    />
                  </div>
                  
                  {/* Session Selection */}
                  <div className="flex-1 space-y-4">
                    <h3 className="font-bold text-slate-700">Chọn buổi khám</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {isLoadingAvailability ? (
                        <div className="text-sm text-slate-500 py-4 text-center">Đang kiểm tra lịch trống...</div>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedSession('morning')}
                            disabled={availability && !availability.morningAvailable}
                            className={`p-4 border-2 rounded-xl text-left transition-all ${
                              availability && !availability.morningAvailable 
                                ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                : selectedSession === 'morning' 
                                  ? 'border-[#2E86AB] bg-blue-50 text-[#2E86AB]' 
                                  : 'border-slate-100 hover:border-blue-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-bold">Buổi Sáng</div>
                              {availability && !availability.morningAvailable && (
                                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded">Đã kín lịch</span>
                              )}
                            </div>
                            <div className="text-sm opacity-80 mt-1">08:00 - 12:00</div>
                          </button>
                          <button
                            onClick={() => setSelectedSession('afternoon')}
                            disabled={availability && !availability.afternoonAvailable}
                            className={`p-4 border-2 rounded-xl text-left transition-all ${
                              availability && !availability.afternoonAvailable 
                                ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                : selectedSession === 'afternoon' 
                                  ? 'border-[#2E86AB] bg-blue-50 text-[#2E86AB]' 
                                  : 'border-slate-100 hover:border-blue-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-bold">Buổi Chiều</div>
                              {availability && !availability.afternoonAvailable && (
                                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded">Đã kín lịch</span>
                              )}
                            </div>
                            <div className="text-sm opacity-80 mt-1">13:00 - 17:00</div>
                          </button>
                        </>
                      )}
                    </div>
                    {selectedSession && (
                      <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 mt-4">
                        <strong>Lưu ý:</strong> Hệ thống sẽ tự động quét và phân bổ cho bạn <strong>khung giờ khám sớm nhất</strong> còn trống trong buổi này. Giờ khám chính xác sẽ được thông báo ngay sau khi bạn xác nhận đặt lịch.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setStep(2)}
                    className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                  >
                    Quay lại
                  </button>
                  <button 
                    onClick={handleNextStep}
                    disabled={!selectedDate || !selectedSession}
                    className="px-8 py-3 bg-[#2E86AB] text-white rounded-xl font-medium hover:bg-[#2E86AB]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Tiếp tục <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-slate-800">Xác nhận thông tin</h2>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-500">Chuyên khoa</span>
                    <span className="font-semibold text-slate-800">{selectedSpecialty?.name}</span>
                  </div>
                  {selectedService && (
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-slate-500">Dịch vụ</span>
                      <span className="font-semibold text-slate-800">{selectedService.name} - {selectedService.price.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-500">Thời gian dự kiến</span>
                    <span className="font-semibold text-[#2E86AB] text-right">
                      {selectedSession === 'morning' ? 'Buổi sáng (08:00 - 12:00)' : 'Buổi chiều (13:00 - 17:00)'} <br/>
                      {selectedDate && format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lý do khám / Triệu chứng (Tùy chọn)</label>
                    <textarea 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent outline-none transition-shadow"
                      rows={3}
                      placeholder="Mô tả ngắn gọn triệu chứng của bạn để bác sĩ dễ dàng chuẩn bị..."
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Cơ chế phân công thông minh:</strong> Hệ thống sẽ tự động quét toàn bộ lịch của chuyên khoa và phân công cho bạn Khung giờ khám sớm nhất còn trống trong buổi này.</p>
                    <p>Lịch hẹn này không áp dụng thu phí trước. Bạn sẽ thanh toán phí khám trực tiếp tại quầy tiếp đón của bệnh viện.</p>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setStep(3)}
                    className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                  >
                    Quay lại
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={bookMutation.isPending}
                    className="px-8 py-3 bg-[#F26419] text-white rounded-xl font-bold hover:bg-[#F26419]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {bookMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Đặt lịch'}
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
