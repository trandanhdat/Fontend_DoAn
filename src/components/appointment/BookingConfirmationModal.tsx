import React from "react";
import { Info, Loader2, X } from "lucide-react";
import { DoctorSummaryCard } from "./DoctorSummaryCard";
import { BookingDetails } from "./BookingDetails";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string, serviceId: number | null) => void;
  isPending: boolean;
  
  // Data for summary
  doctorName: string;
  specialtyName: string;
  experienceYears: number;
  doctorAvatar?: string | null;
  
  services?: any[];
  consultationFee: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  
  doctorName,
  specialtyName,
  experienceYears,
  doctorAvatar,
  services = [],
  consultationFee,
  appointmentDate,
  startTime,
  endTime
}) => {
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [selectedServiceId, setSelectedServiceId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setReason("");
      setNotes("");
      setSelectedServiceId(null);
    }
  }, [isOpen]);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const totalFee = consultationFee + (selectedService?.price || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center border-2 border-[#15718E]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#15718E]"></div>
            </div>
            <h2 className="text-lg font-bold text-slate-800">Xác nhận thông tin đặt lịch</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <DoctorSummaryCard 
            doctorName={doctorName}
            specialtyName={specialtyName}
            experienceYears={experienceYears}
            doctorAvatar={doctorAvatar}
          />

          <BookingDetails 
            services={services}
            selectedServiceId={selectedServiceId}
            onServiceChange={setSelectedServiceId}
            consultationFee={totalFee}
            appointmentDate={appointmentDate}
            startTime={startTime}
            endTime={endTime}
          />

        {/* Reason and Notes */}
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Lý do khám bệnh</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Đau đầu, chóng mặt..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú thêm (Không bắt buộc)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Triệu chứng kéo dài bao lâu, đã uống thuốc gì chưa..."
                rows={2}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] resize-none"
              />
            </div>
          </div>

          {/* Warning box */}
          <div className="bg-[#f0f9ff] border-l-4 border-[#15718E] p-4 rounded-r-lg flex items-start gap-3 mt-6">
            <Info className="w-5 h-5 text-[#15718E] shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 leading-relaxed">
              Vui lòng có mặt tại phòng khám 15 phút trước giờ hẹn để hoàn tất thủ tục check-in. 
              Bạn có thể hủy hoặc đổi lịch hẹn trước 24 giờ.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-4 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-2.5 font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors disabled:opacity-50"
          >
            Quay lại
          </button>
          
          <button 
            type="button"
            onClick={() => onConfirm(reason.trim(), notes.trim(), selectedServiceId)}
            disabled={isPending}
            className="px-6 py-2.5 min-w-[160px] font-semibold text-white bg-[#15718E] hover:bg-[#105d76] rounded-md transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận đặt lịch"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
