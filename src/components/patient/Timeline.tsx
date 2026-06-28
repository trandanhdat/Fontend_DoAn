import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, User, FileText } from 'lucide-react';
import { Button } from '../ui/button';

interface TimelineItem {
  id: number;
  date: string;
  doctorName?: string;
  serviceName?: string;
  diagnosis?: string;
  onClick: (id: number) => void;
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Chưa có hồ sơ khám bệnh nào.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-slate-200 ml-3 md:ml-6 space-y-8 pb-4">
      {items.map((item, index) => (
        <div key={item.id} className="relative pl-6 md:pl-8">
          {/* Node */}
          <div className="absolute w-4 h-4 bg-[#15718E] rounded-full -left-2.5 top-1.5 border-4 border-white shadow-sm" />
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-[#15718E] font-medium">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(item.date), 'dd MMMM, yyyy', { locale: vi })}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-fit text-xs"
                onClick={() => item.onClick(item.id)}
              >
                Xem chi tiết
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Bác sĩ điều trị</p>
                  <p className="text-sm font-medium text-slate-700">{item.doctorName || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Chẩn đoán sơ bộ</p>
                  <p className="text-sm font-medium text-slate-700 line-clamp-1" title={item.diagnosis}>
                    {item.diagnosis || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
