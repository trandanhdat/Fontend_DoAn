import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

import { DoctorSelectionStep } from '../../components/appointment/book-steps/DoctorSelectionStep';
import { ServiceSelectionStep } from '../../components/appointment/book-steps/ServiceSelectionStep';
import { TimeSelectionStep } from '../../components/appointment/book-steps/TimeSelectionStep';
import { ConfirmStep } from '../../components/appointment/book-steps/ConfirmStep';

import { appointmentService } from '../../services/appointment.service';
import { useAuthStore } from '../../store/auth.store';

export interface AppointmentFormValues {
  specialtyId: number | null;
  doctorId: number | null;
  serviceId: number | null;
  appointmentDate: string;
  timeSlotId: number | null;
  startTime: string;
  reason: string;
  notes: string;
}

const STEPS = [
  { id: 1, title: 'Chọn Bác sĩ' },
  { id: 2, title: 'Chọn Dịch vụ' },
  { id: 3, title: 'Chọn Thời gian' },
  { id: 4, title: 'Xác nhận' }
];

export const BookAppointmentPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<AppointmentFormValues>({
    defaultValues: {
      specialtyId: null,
      doctorId: null,
      serviceId: null,
      appointmentDate: '',
      timeSlotId: null,
      startTime: '',
      reason: '',
      notes: ''
    }
  });

  const { handleSubmit, watch, setValue } = methods;
  const watchDoctorId = watch('doctorId');
  const watchServiceId = watch('serviceId');
  const watchTimeSlotId = watch('timeSlotId');

  useEffect(() => {
    // Nếu có doctorId từ URL
    const params = new URLSearchParams(location.search);
    const doctorIdParam = params.get('doctorId');
    if (doctorIdParam) {
      setValue('doctorId', parseInt(doctorIdParam, 10));
    }
  }, [location, setValue]);

  const handleNext = () => {
    if (currentStep === 1 && !watchDoctorId) {
      toast.error('Vui lòng chọn bác sĩ để tiếp tục.');
      return;
    }
    if (currentStep === 2 && !watchServiceId) {
      toast.error('Vui lòng chọn dịch vụ khám.');
      return;
    }
    if (currentStep === 3 && !watchTimeSlotId) {
      toast.error('Vui lòng chọn thời gian khám.');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: AppointmentFormValues) => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để đặt lịch.');
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      setIsSubmitting(true);
      await appointmentService.bookAppointment({
        patientId: user.patientId!,
        doctorId: data.doctorId!,
        timeSlotId: data.timeSlotId!,
        serviceId: data.serviceId || undefined,
        appointmentDate: data.appointmentDate,
        startTime: data.startTime,
        reason: data.reason.trim() || undefined,
        notes: data.notes.trim() || undefined
      });
      toast.success('Đặt lịch khám thành công!');
      navigate('/patient/records');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Đặt lịch khám</h1>
        <p className="text-slate-500 mt-2">Hoàn thành các bước dưới đây để đặt lịch với bác sĩ</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#15718E] z-0 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>
          
          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                    isActive 
                      ? 'bg-white border-[#15718E] text-[#15718E]' 
                      : isCompleted 
                        ? 'bg-[#15718E] border-[#15718E] text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className={`mt-2 text-xs font-semibold ${isActive ? 'text-[#15718E]' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              {currentStep === 1 && <DoctorSelectionStep />}
              {currentStep === 2 && <ServiceSelectionStep />}
              {currentStep === 3 && <TimeSelectionStep />}
              {currentStep === 4 && <ConfirmStep />}
            </div>

            {/* Footer Navigation */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quay lại
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-lg font-bold text-white bg-[#15718E] hover:bg-[#105d76] transition-colors flex items-center gap-2"
                >
                  Tiếp tục <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg font-bold text-white bg-[#15718E] hover:bg-[#105d76] transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
