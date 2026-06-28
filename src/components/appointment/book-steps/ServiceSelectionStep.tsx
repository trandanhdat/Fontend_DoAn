import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Loader2, Clock, DollarSign } from 'lucide-react';

import { useServicesBySpecialty } from '../../../hooks/useServices';
import type { AppointmentFormValues } from '../../../pages/patient/BookAppointmentPage';

export const ServiceSelectionStep: React.FC = () => {
  const { setValue, watch } = useFormContext<AppointmentFormValues>();
  const specialtyId = watch('specialtyId');
  const serviceId = watch('serviceId');

  const { data: services = [], isLoading } = useServicesBySpecialty(specialtyId || undefined);

  // Auto-select first service if there's only one, or clear invalid service
  useEffect(() => {
    if (services.length > 0 && !serviceId) {
      // Auto-select the first one optionally
      // setValue('serviceId', services[0].id);
    } else if (services.length > 0 && serviceId) {
      const isValid = services.some(s => s.id === serviceId);
      if (!isValid) setValue('serviceId', null);
    }
  }, [services, serviceId, setValue]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-300">
        <Loader2 className="w-8 h-8 text-[#15718E] animate-spin mb-4" />
        <p className="text-slate-500">Đang tải danh sách dịch vụ...</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in duration-300">
        <p className="text-slate-500">Chuyên khoa này hiện chưa có dịch vụ nào.</p>
        <button
          type="button"
          onClick={() => setValue('serviceId', null)} // just for fallback
          className="mt-4 px-4 py-2 text-sm text-[#15718E] hover:underline"
        >
          Bỏ qua chọn dịch vụ
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Chọn Dịch vụ Khám</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => (
          <button
            key={service.id}
            type="button"
            onClick={() => setValue('serviceId', service.id)}
            className={`flex flex-col text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
              serviceId === service.id
                ? 'border-[#15718E] bg-[#15718E]/5 shadow-sm'
                : 'border-slate-100 bg-white hover:border-[#15718E]/30 hover:shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-2 w-full">
              <h4 className="font-bold text-slate-800 text-base">{service.name}</h4>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                serviceId === service.id ? 'border-[#15718E]' : 'border-slate-300'
              }`}>
                {serviceId === service.id && <div className="w-2.5 h-2.5 rounded-full bg-[#15718E]" />}
              </div>
            </div>
            
            {/* Description placeholder if API doesn't have it, assume name or empty */}
            <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
              Dịch vụ khám chuyên sâu, được thực hiện bởi bác sĩ chuyên khoa với trang thiết bị hiện đại.
            </p>
            
            <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100/60 w-full">
              <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {service.durationMinutes} phút
              </div>
              <div className="flex items-center text-sm font-bold text-orange-500">
                <DollarSign className="w-4 h-4 mr-0.5" />
                {service.price.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
