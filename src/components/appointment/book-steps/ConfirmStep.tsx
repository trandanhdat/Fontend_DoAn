import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { User, Stethoscope, CalendarDays, Clock, FileText, Banknote } from 'lucide-react';

import { doctorService } from '../../../services/doctor.service';
import { useServicesBySpecialty } from '../../../hooks/useServices';
import type { AppointmentFormValues } from '../../../pages/patient/BookAppointmentPage';

export const ConfirmStep: React.FC = () => {
  const { register, watch } = useFormContext<AppointmentFormValues>();
  
  const doctorId = watch('doctorId');
  const specialtyId = watch('specialtyId');
  const serviceId = watch('serviceId');
  const appointmentDate = watch('appointmentDate');
  const startTime = watch('startTime');

  const { data: doctor } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => doctorService.getById(doctorId!),
    enabled: !!doctorId,
  });

  const { data: services } = useServicesBySpecialty(specialtyId || undefined);
  const selectedService = services?.find(s => s.id === serviceId);

  const formattedDate = appointmentDate 
    ? format(new Date(appointmentDate), 'dd/MM/yyyy') 
    : '';

  const totalFee = (doctor?.consultationFee || 0) + (selectedService?.price || 0);

  return (
    <div className="animate-in fade-in duration-300">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Xác nhận Đặt lịch</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột Trái: Thông tin */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Thông tin Khám</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Bác sĩ</div>
                  <div className="font-semibold text-slate-800">
                    {doctor ? `${doctor.degree}, BS. ${doctor.fullName}` : 'Đang tải...'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Dịch vụ</div>
                  <div className="font-semibold text-slate-800">
                    {selectedService ? selectedService.name : 'Khám chuyên khoa (Mặc định)'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Ngày khám</div>
                  <div className="font-semibold text-slate-800">{formattedDate}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Giờ khám</div>
                  <div className="font-semibold text-slate-800">{startTime.substring(0, 5)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
            <div className="flex items-start gap-3 mb-3">
              <Banknote className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <div className="text-xs text-orange-600/80 font-medium">Phí khám dự kiến</div>
                <div className="font-bold text-orange-600 text-lg">{totalFee.toLocaleString('vi-VN')} đ</div>
              </div>
            </div>
            <div className="text-xs text-orange-600/70 italic ml-8">
              (Bao gồm phí tư vấn bác sĩ: {(doctor?.consultationFee || 0).toLocaleString('vi-VN')} đ 
              {selectedService ? ` và phí dịch vụ: ${selectedService.price.toLocaleString('vi-VN')} đ` : ''})
            </div>
          </div>
        </div>

        {/* Cột Phải: Form nhập liệu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <FileText className="w-5 h-5 text-[#15718E]" />
            <h4 className="font-bold text-slate-800">Lý do & Ghi chú</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Lý do khám bệnh <span className="text-red-500">*</span>
              </label>
              <input
                {...register('reason', { required: true })}
                type="text"
                placeholder="Ví dụ: Đau đầu, chóng mặt..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#15718E] focus:ring-2 focus:ring-[#15718E]/20 transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Ghi chú thêm (Không bắt buộc)
              </label>
              <textarea
                {...register('notes')}
                placeholder="Triệu chứng kéo dài bao lâu, đã uống thuốc gì chưa..."
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#15718E] focus:ring-2 focus:ring-[#15718E]/20 transition-all bg-slate-50 focus:bg-white resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
