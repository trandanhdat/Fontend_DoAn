import React from "react";
import { Calendar, Clock, PlusSquare, CreditCard } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingDetailsProps {
  services?: any[];
  selectedServiceId?: number | null;
  onServiceChange?: (id: number) => void;
  consultationFee: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
}

export const BookingDetails: React.FC<BookingDetailsProps> = ({
  services = [],
  selectedServiceId,
  onServiceChange,
  consultationFee,
  appointmentDate,
  startTime,
  endTime
}) => {
  let displayDate = appointmentDate;
  try {
    const formattedDate = format(parseISO(appointmentDate), "EEEE, dd/MM/yyyy", { locale: vi });
    displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  } catch (e) {
    // fallback if date is invalid
  }
  
  // Format times: "09:00:00" -> "09:00"
  const formattedStartTime = startTime.substring(0, 5);
  const formattedEndTime = endTime.substring(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dịch vụ</p>
        <div className="flex items-start gap-2">
          <PlusSquare className="w-5 h-5 text-[#15718E] shrink-0 mt-0.5" />
          {services.length > 0 && onServiceChange ? (
            <select 
              value={selectedServiceId || ''} 
              onChange={(e) => onServiceChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full text-slate-800 font-medium bg-transparent border-b border-slate-200 focus:outline-none focus:border-[#15718E] pb-1 text-sm cursor-pointer hover:border-[#15718E] [&>option]:bg-white"
            >
              <option value="" className="bg-white text-slate-700">Chỉ khám tư vấn (Không chọn thêm)</option>
              {services.map(svc => (
                <option key={svc.id} value={svc.id} className="bg-white text-slate-700">
                  {svc.name} (+{svc.price.toLocaleString('vi-VN')}đ)
                </option>
              ))}
            </select>
          ) : (
            <span className="text-slate-800 font-medium text-sm pt-0.5">Khám tư vấn chuyên khoa</span>
          )}
        </div>
      </div>
      
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ngày hẹn</p>
        <div className="flex items-start gap-2">
          <Calendar className="w-5 h-5 text-[#15718E] shrink-0 mt-0.5" />
          <span className="text-slate-800 font-medium">{displayDate}</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phí khám</p>
        <div className="flex items-start gap-2">
          <CreditCard className="w-5 h-5 text-[#15718E] shrink-0 mt-0.5" />
          <span className="text-slate-800 font-bold">{consultationFee.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Thời gian</p>
        <div className="flex items-start gap-2">
          <Clock className="w-5 h-5 text-[#15718E] shrink-0 mt-0.5" />
          <span className="text-slate-800 font-medium">{formattedStartTime} - {formattedEndTime}</span>
        </div>
      </div>
    </div>
  );
};
