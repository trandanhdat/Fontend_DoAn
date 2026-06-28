import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { specialtyService } from '../../../services/specialty.service';
import { doctorService } from '../../../services/doctor.service';
import type { AppointmentFormValues } from '../../../pages/patient/BookAppointmentPage';

export const DoctorSelectionStep: React.FC = () => {
  const { setValue, watch } = useFormContext<AppointmentFormValues>();
  const specialtyId = watch('specialtyId');
  const doctorId = watch('doctorId');

  const { data: specialties = [], isLoading: loadingSpecialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: specialtyService.getAllActive,
  });

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors', specialtyId],
    queryFn: () => {
      if (!specialtyId) return Promise.resolve([]);
      return doctorService.getBySpecialty(specialtyId);
    },
    enabled: !!specialtyId,
  });

  // Nếu user đổi chuyên khoa, reset bác sĩ đã chọn
  useEffect(() => {
    if (specialtyId) {
      const isDoctorInSpecialty = doctors.some(d => d.id === doctorId);
      if (!isDoctorInSpecialty) {
        setValue('doctorId', null);
      }
    }
  }, [specialtyId, doctors, doctorId, setValue]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Chọn Chuyên khoa */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">1. Chọn Chuyên khoa</h3>
        {loadingSpecialties ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải chuyên khoa...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {specialties.map(spec => (
              <button
                key={spec.id}
                type="button"
                onClick={() => setValue('specialtyId', spec.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  specialtyId === spec.id 
                    ? 'border-[#15718E] bg-[#15718E]/5 text-[#15718E]' 
                    : 'border-slate-100 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="font-semibold text-sm">{spec.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chọn Bác sĩ */}
      {specialtyId && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-slate-800 mb-4">2. Chọn Bác sĩ</h3>
          {loadingDoctors ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" /> Đang tải danh sách bác sĩ...
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-4 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 text-center italic">
              Chưa có bác sĩ nào trong chuyên khoa này.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map(doctor => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => setValue('doctorId', doctor.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    doctorId === doctor.id
                      ? 'border-[#15718E] bg-[#15718E]/5'
                      : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={doctor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=f1f5f9&color=15718E&size=150`}
                      alt={doctor.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{doctor.degree}, BS. {doctor.fullName}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{doctor.bio || 'Chuyên gia y tế'}</p>
                    <div className="text-sm font-semibold text-orange-500 mt-1">
                      Giá khám: {doctor.consultationFee.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
