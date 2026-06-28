import React, { useState } from 'react';
import { useMedicalHistory } from '../../hooks/useMedicalHistory';
import { Timeline } from '../../components/patient/Timeline';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { FileText, Calendar, User, Stethoscope, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const MedicalHistoryPage: React.FC = () => {
  const { medicalRecords, isLoading } = useMedicalHistory();
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  if (isLoading) {
    return <div className="p-8 max-w-4xl mx-auto animate-pulse flex flex-col gap-6">
      <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-32 bg-slate-200 rounded-xl"></div>
      <div className="h-32 bg-slate-200 rounded-xl"></div>
    </div>;
  }

  const selectedRecord = medicalRecords.find(r => r.id === selectedRecordId);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Lịch sử khám bệnh</h1>
        <p className="text-slate-500 mt-1">Theo dõi hồ sơ bệnh án và lịch sử điều trị của bạn.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <Timeline 
          items={medicalRecords.map(record => ({
            id: record.id,
            date: record.appointmentDate,
            doctorName: record.doctorName,
            diagnosis: record.diagnosis,
            onClick: setSelectedRecordId
          }))}
        />
      </div>

      {/* Modal Chi Tiết Hồ Sơ */}
      <Dialog open={!!selectedRecordId} onOpenChange={(open) => !open && setSelectedRecordId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="border-b border-slate-100 pb-4 mb-4">
            <DialogTitle className="text-xl text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#15718E]" />
              Chi tiết hồ sơ bệnh án #{selectedRecord?.id}
            </DialogTitle>
            <DialogDescription>Ngày khám: {selectedRecord ? format(new Date(selectedRecord.appointmentDate), 'dd/MM/yyyy') : ''}</DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3"/> Bác sĩ điều trị</p>
                  <p className="font-medium text-slate-800 mt-1">{selectedRecord.doctorName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Stethoscope className="w-3 h-3"/> Dịch vụ</p>
                  <p className="font-medium text-slate-800 mt-1">{selectedRecord.serviceName || 'Khám chuyên khoa'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Triệu chứng</h4>
                <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedRecord.symptoms || 'Không ghi nhận'}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Chẩn đoán</h4>
                <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedRecord.diagnosis || 'Chưa có chẩn đoán'}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Phác đồ điều trị / Kê đơn</h4>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm text-emerald-800 whitespace-pre-wrap">
                  {selectedRecord.treatment || 'Chưa có hướng điều trị'}
                </div>
              </div>

              {selectedRecord.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Lời dặn của bác sĩ</h4>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800 whitespace-pre-wrap">
                    {selectedRecord.notes}
                  </div>
                </div>
              )}

              {selectedRecord.followUpDate && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-medium border border-blue-100">
                  <Clock className="w-4 h-4" />
                  Ngày hẹn tái khám: {format(new Date(selectedRecord.followUpDate), 'dd/MM/yyyy')}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalHistoryPage;
