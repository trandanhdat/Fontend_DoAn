import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ArrowLeft, Save, CalendarDays, User, Stethoscope } from 'lucide-react';

import { appointmentService } from '@/services/appointment.service';
import { medicalRecordService } from '@/services/medical-record.service';
import type { CreateMedicalRecordDto } from '@/models/api.model';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateMedicalRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appointmentId = Number(id);

  const [needsFollowUp, setNeedsFollowUp] = useState(false);

  const [formData, setFormData] = useState<CreateMedicalRecordDto>({
    appointmentId: appointmentId,
    diagnosis: '',
    treatment: '',
    symptoms: '',
    notes: '',
    followUpDate: ''
  });

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentService.getById(appointmentId),
    enabled: !!appointmentId
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMedicalRecordDto) => medicalRecordService.createRecord(data),
    onSuccess: () => {
      toast.success('Đã lưu hồ sơ bệnh án thành công!');
      navigate('/doctor/patient-records');
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi lưu hồ sơ: ${err.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.diagnosis || !formData.treatment) {
      toast.error('Vui lòng nhập Chẩn đoán và Phác đồ điều trị');
      return;
    }

    // Convert empty string to undefined for backend
    const payload = { ...formData };
    if (!payload.followUpDate) payload.followUpDate = undefined;

    createMutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div className="p-8 text-center">Đang tải thông tin...</div>;
  if (!appointment) return <div className="p-8 text-center text-red-500">Không tìm thấy lịch hẹn.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tạo hồ sơ bệnh án mới</h1>
          <p className="text-slate-500">Điền thông tin khám bệnh cho lịch hẹn #{appointment.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thông tin bệnh nhân & lịch hẹn */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Thông tin chung
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase">Bệnh nhân</p>
                <p className="text-base font-semibold text-slate-800">{appointment.patientName}</p>
              </div>
              {appointment.serviceName && (
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase">Dịch vụ</p>
                  <p className="text-base font-semibold text-slate-800">{appointment.serviceName}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> Thời gian
                </p>
                <p className="text-base font-semibold text-slate-800 mt-1">
                  {format(new Date(appointment.slotDate), 'dd/MM/yyyy')} <br />
                  <span className="text-blue-600">{appointment.startTime.substring(0, 5)} - {appointment.endTime.substring(0, 5)}</span>
                </p>
              </div>
              {appointment.reason && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <p className="text-xs font-bold text-amber-800 uppercase mb-1">Lý do khám</p>
                  <p className="text-sm text-amber-900">{appointment.reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form điền hồ sơ */}
        <div className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-emerald-600" />
                Kết quả khám
              </CardTitle>
              <CardDescription>
                Nhập chẩn đoán và hướng điều trị. Sau khi lưu, trạng thái lịch hẹn sẽ tự động hoàn thành.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis" className="text-sm font-semibold text-slate-700">
                    Chẩn đoán bệnh <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="diagnosis" name="diagnosis"
                    placeholder="VD: Viêm họng hạt cấp tính..."
                    value={formData.diagnosis} onChange={handleChange}
                    required
                    className="bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="text-sm font-semibold text-slate-700">Triệu chứng & Ghi chú</Label>
                  <textarea
                    id="symptoms" name="symptoms"
                    rows={3}
                    className="flex w-full bg-white text-slate-900 rounded-md border border-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Mô tả chi tiết triệu chứng của bệnh nhân..."
                    value={formData.symptoms} onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment" className="text-sm font-semibold text-slate-700">
                    Phác đồ điều trị / Đơn thuốc <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="treatment" name="treatment"
                    rows={4}
                    className="flex w-full bg-white text-slate-900 rounded-md border border-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="VD: Amoxicillin 500mg, ngày 2 lần..."
                    value={formData.treatment} onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Chỉ định tái khám</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={!needsFollowUp ? 'default' : 'outline'}
                      className={!needsFollowUp ? 'bg-slate-700 hover:bg-slate-800 text-white' : 'text-slate-600'}
                      onClick={() => {
                        setNeedsFollowUp(false);
                        setFormData(p => ({ ...p, followUpDate: '' }));
                      }}
                    >
                      Không cần tái khám
                    </Button>
                    <Button
                      type="button"
                      variant={needsFollowUp ? 'default' : 'outline'}
                      className={needsFollowUp ? 'bg-[#2E86AB] hover:bg-[#256d8c] text-white' : 'text-slate-600'}
                      onClick={() => setNeedsFollowUp(true)}
                    >
                      Có hẹn tái khám
                    </Button>
                  </div>

                  {needsFollowUp && (
                    <div className="w-1/2 pt-2 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="followUpDate" className="text-sm font-semibold text-slate-700 mb-1.5 block">
                        Chọn ngày tái khám <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="followUpDate" name="followUpDate" type="date"
                        value={formData.followUpDate} onChange={handleChange}
                        className="bg-white text-slate-900"
                        required={needsFollowUp}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>Hủy bỏ</Button>
                  <Button type="submit" disabled={createMutation.isPending} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Save className="h-4 w-4" />
                    {createMutation.isPending ? 'Đang lưu...' : 'Lưu hồ sơ'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
