import React, { useMemo, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, Calendar } from 'lucide-react';

import { scheduleService } from '../../../services/schedule.service';
import type { AppointmentFormValues } from '../../../pages/patient/BookAppointmentPage';

export const TimeSelectionStep: React.FC = () => {
  const { setValue, watch } = useFormContext<AppointmentFormValues>();
  const doctorId = watch('doctorId');
  const selectedDate = watch('appointmentDate');
  const selectedTimeSlotId = watch('timeSlotId');

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['doctorSchedules', doctorId],
    queryFn: () => scheduleService.getDoctorSchedules(doctorId!),
    enabled: !!doctorId,
  });

  const { data: realSlots = [], isLoading: loadingRealSlots } = useQuery({
    queryKey: ['realTimeslots', doctorId, selectedDate],
    queryFn: () => scheduleService.getAllSlots(doctorId!, selectedDate),
    enabled: !!doctorId && !!selectedDate,
  });

  const loadingSlots = loadingSchedules || loadingRealSlots;

  const allSlots = useMemo(() => {
    if (!schedules.length) return [];
    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let addedDays = 0;
    let dayOffset = 0;

    while (addedDays < 5) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);

      const dayOfWeek = currentDate.getDay(); 

      // Bỏ qua Thứ 7 (6) và Chủ Nhật (0)
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
        day: format(dateObj, "EEEE").replace("Monday", "Thứ 2").replace("Tuesday", "Thứ 3")
          .replace("Wednesday", "Thứ 4").replace("Thursday", "Thứ 5")
          .replace("Friday", "Thứ 6").replace("Saturday", "Thứ 7").replace("Sunday", "CN"),
        dateStr: format(dateObj, "dd-MM")
      };
    });
  }, [allSlots]);

  useEffect(() => {
    if (dates.length > 0 && (!selectedDate || !dates.find(d => d.fullDate === selectedDate))) {
      setValue('appointmentDate', dates[0].fullDate);
      setValue('timeSlotId', null);
      setValue('startTime', '');
    }
  }, [dates, selectedDate, setValue]);

  const timeSlots = useMemo(() => {
    return allSlots.filter(s => s.slotDate === selectedDate);
  }, [allSlots, selectedDate]);

  const morningSlots = timeSlots.filter(s => parseInt(s.startTime.split(':')[0]) < 12);
  const afternoonSlots = timeSlots.filter(s => parseInt(s.startTime.split(':')[0]) >= 12);

  const handleSelectSlot = (slotId: number, startTime: string) => {
    setValue('timeSlotId', slotId);
    setValue('startTime', startTime);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Chọn Ngày và Giờ khám</h3>

      <div className="mb-8">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
          <Calendar className="w-4 h-4 text-[#15718E]" /> Ngày khám
        </h4>
        
        {loadingSlots && dates.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải lịch khám...
          </div>
        ) : dates.length > 0 ? (
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {dates.map((d, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setValue('appointmentDate', d.fullDate);
                  setValue('timeSlotId', null);
                  setValue('startTime', '');
                }}
                className={`flex flex-col items-center justify-center py-3 px-1 sm:px-2 rounded-xl border-2 transition-all ${
                  selectedDate === d.fullDate
                    ? 'bg-[#15718E] border-[#15718E] text-white shadow-md shadow-[#15718E]/20'
                    : 'bg-white border-slate-100 text-slate-600 hover:border-[#15718E]/30 hover:bg-slate-50'
                }`}
              >
                <span className={`text-xs font-semibold uppercase mb-1 opacity-80`}>{d.day}</span>
                <span className="text-sm font-bold">{d.dateStr}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 italic py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
            Bác sĩ chưa có lịch làm việc trong thời gian tới.
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="space-y-6">
          {timeSlots.length === 0 ? (
            <div className="text-sm text-slate-500 italic py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
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
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {morningSlots.map(slot => {
                      const isBooked = slot.status === 'Booked' || slot.status === 'Blocked';
                      const isDisabled = isBooked || !slot.isReal;
                      return (
                        <div key={slot.id} className="flex flex-col items-center relative">
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleSelectSlot(slot.id, slot.startTime)}
                            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                              isDisabled
                                ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100'
                                : selectedTimeSlotId === slot.id
                                  ? 'bg-[#15718E]/10 border-[#15718E] text-[#15718E]'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-[#15718E]/50 hover:text-[#15718E]'
                            }`}
                          >
                            {slot.startTime.substring(0, 5)}
                          </button>
                          {isBooked && <span className="absolute -bottom-4 text-[10px] text-red-500 font-medium whitespace-nowrap">Đã đặt</span>}
                          {(!isBooked && !slot.isReal) && <span className="absolute -bottom-4 text-[10px] text-slate-400 font-medium whitespace-nowrap">Chưa mở</span>}
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
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {afternoonSlots.map(slot => {
                      const isBooked = slot.status === 'Booked' || slot.status === 'Blocked';
                      const isDisabled = isBooked || !slot.isReal;
                      return (
                        <div key={slot.id} className="flex flex-col items-center relative">
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleSelectSlot(slot.id, slot.startTime)}
                            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                              isDisabled
                                ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100'
                                : selectedTimeSlotId === slot.id
                                  ? 'bg-[#15718E]/10 border-[#15718E] text-[#15718E]'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-[#15718E]/50 hover:text-[#15718E]'
                            }`}
                          >
                            {slot.startTime.substring(0, 5)}
                          </button>
                          {isBooked && <span className="absolute -bottom-4 text-[10px] text-red-500 font-medium whitespace-nowrap">Đã đặt</span>}
                          {(!isBooked && !slot.isReal) && <span className="absolute -bottom-4 text-[10px] text-slate-400 font-medium whitespace-nowrap">Chưa mở</span>}
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
      
      {/* Margin bottom for absolutely positioned labels */}
      <div className="h-4"></div>
    </div>
  );
};
