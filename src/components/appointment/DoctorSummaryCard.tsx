import React from "react";
import { User } from "lucide-react";

interface DoctorSummaryCardProps {
  doctorName: string;
  specialtyName: string;
  experienceYears: number;
  doctorAvatar?: string | null;
}

export const DoctorSummaryCard: React.FC<DoctorSummaryCardProps> = ({
  doctorName,
  specialtyName,
  experienceYears,
  doctorAvatar
}) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white mb-6">
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
        {doctorAvatar ? (
          <img src={doctorAvatar} alt={doctorName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <User className="w-8 h-8 text-slate-400" />
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-[#15718E] mb-1">Bác sĩ điều trị</p>
        <h3 className="text-lg font-bold text-slate-800">{doctorName}</h3>
        <p className="text-sm text-slate-500">
          Chuyên khoa {specialtyName} • {experienceYears} năm kinh nghiệm
        </p>
      </div>
    </div>
  );
};
