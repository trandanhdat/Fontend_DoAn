import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { X, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useCancelAppointment, useRescheduleAppointment, useAssignDoctor, useCheckIn } from '../../hooks/useDoctorAppointments';
import { scheduleService } from '../../services/schedule.service';
import { doctorService } from '../../services/doctor.service';
import type { AppointmentDto } from '../../models/api.model';

// ─── Check-In Modal ──────────────────────────────────────────────────────────
export const CheckInModal = ({ appt, isOpen, onClose }: { appt: AppointmentDto | null, isOpen: boolean, onClose: () => void }) => {
  const checkInMutation = useCheckIn();

  const handleConfirm = () => {
    if (!appt) return;
    checkInMutation.mutate(appt.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const fee = appt?.fee || 0;
  const deposit = appt?.paymentStatus === 'Paid' ? 100000 : 0;
  const remaining = fee - deposit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Xác nhận Check-in & Thu tiền</DialogTitle>
          <DialogDescription className="text-base text-slate-700 mt-2">
            Bệnh nhân <span className="font-bold text-slate-900">{appt?.patientName}</span> đã đến phòng khám. 
            Vui lòng thu khoản phí còn lại trước khi cho bệnh nhân vào phòng khám.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Tổng phí khám (dự kiến):</span>
              <span className="font-medium text-slate-800">{fee.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Đã đặt cọc (VNPAY):</span>
              <span className="font-medium text-emerald-600">-{deposit.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-800">Số tiền cần thu thêm:</span>
              <span className="text-xl font-bold text-red-600">{remaining > 0 ? remaining.toLocaleString('vi-VN') : 0} VNĐ</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 italic">
            * Nhấn Xác nhận đồng nghĩa với việc Lễ tân đã thu đủ số tiền <span className="font-bold text-slate-700">{remaining > 0 ? remaining.toLocaleString('vi-VN') : 0} VNĐ</span> từ bệnh nhân.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={checkInMutation.isPending}>Hủy</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirm} disabled={checkInMutation.isPending}>
            {checkInMutation.isPending ? 'Đang xử lý...' : 'Xác nhận thu tiền & Check-in'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Cancel Modal ────────────────────────────────────────────────────────
export const CancelModal = ({ appt, isOpen, onClose }: { appt: AppointmentDto | null, isOpen: boolean, onClose: () => void }) => {
  const cancelMutation = useCancelAppointment();

  const handleConfirm = () => {
    if (!appt) return;
    cancelMutation.mutate({ id: appt.id }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Xác nhận Hủy Lịch</DialogTitle>
          <DialogDescription className="text-base text-slate-700 mt-2">
            Bạn có chắc chắn muốn hủy lịch khám của bệnh nhân <span className="font-bold text-slate-800">{appt?.patientName}</span> vào lúc {appt?.startTime?.slice(0, 5)} ngày {appt?.slotDate ? format(new Date(appt.slotDate), 'dd/MM/yyyy') : ''}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={cancelMutation.isPending}>Thoát</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={cancelMutation.isPending}>
            {cancelMutation.isPending ? 'Đang hủy...' : 'Đồng ý Hủy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Reschedule Modal ────────────────────────────────────────────────────────
export const RescheduleModal = ({ appt, isOpen, onClose }: { appt: AppointmentDto | null, isOpen: boolean, onClose: () => void }) => {
  const [date, setDate] = useState<string>('');
  const [slotId, setSlotId] = useState<string>('');
  const rescheduleMutation = useRescheduleAppointment();

  // Load slots for the selected date and current doctor
  const { data: slots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ['available-slots', appt?.doctorId, date],
    queryFn: () => scheduleService.getAvailableSlots(appt?.doctorId || 0, date),
    enabled: !!appt?.doctorId && !!date,
  });

  // Reset form when opened
  React.useEffect(() => {
    if (isOpen && appt) {
      setDate(format(new Date(appt.slotDate), 'yyyy-MM-dd'));
      setSlotId('');
    }
  }, [isOpen, appt]);

  const handleConfirm = () => {
    if (!appt || !date || !slotId) return;
    rescheduleMutation.mutate({
      id: appt.id,
      appointmentDate: date,
      timeSlotId: parseInt(slotId)
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Dời Lịch Hẹn</DialogTitle>
          <DialogDescription className="text-base text-slate-700 mt-2">
            Chọn ngày và khung giờ trống để dời lịch khám cho bệnh nhân <span className="font-bold text-slate-900">{appt?.patientName}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800">Ngày khám mới</label>
            <input 
              type="date" 
              className="w-full bg-white border-slate-200 rounded-md p-2 text-sm border focus:ring-emerald-500 focus:border-emerald-500" 
              value={date} 
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => {
                setDate(e.target.value);
                setSlotId('');
              }} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800">Khung giờ trống</label>
            {isLoadingSlots ? (
              <p className="text-sm text-slate-500">Đang tải...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-red-500">Không có khung giờ rảnh trong ngày này.</p>
            ) : (
              <Select value={slotId} onValueChange={setSlotId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giờ khám" />
                </SelectTrigger>
                <SelectContent>
                  {slots.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={rescheduleMutation.isPending}>Hủy</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirm} disabled={!slotId || rescheduleMutation.isPending}>
            {rescheduleMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Dời lịch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Assign Doctor Modal ─────────────────────────────────────────────────────
export const AssignDoctorModal = ({ appt, isOpen, onClose }: { appt: AppointmentDto | null, isOpen: boolean, onClose: () => void }) => {
  const [doctorId, setDoctorId] = useState<string>('');
  const [slotId, setSlotId] = useState<string>('');
  const assignDoctorMutation = useAssignDoctor();

  // Load doctors by specialty
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors-by-specialty', appt?.specialtyId],
    queryFn: () => doctorService.getBySpecialty(appt?.specialtyId || 0),
    enabled: !!appt?.specialtyId,
  });

  // Filter out the current doctor
  const availableDoctors = doctors.filter(d => d.id !== appt?.doctorId);

  // Load slots for selected doctor
  const { data: slots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ['available-slots', doctorId, appt?.slotDate],
    queryFn: () => scheduleService.getAvailableSlots(parseInt(doctorId), appt?.slotDate),
    enabled: !!doctorId && !!appt?.slotDate,
  });

  React.useEffect(() => {
    if (isOpen) {
      setDoctorId('');
      setSlotId('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!appt || !doctorId || !slotId) return;
    assignDoctorMutation.mutate({
      id: appt.id,
      doctorId: parseInt(doctorId),
      timeSlotId: parseInt(slotId)
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Phân Công Bác Sĩ Mới</DialogTitle>
          <DialogDescription className="text-base text-slate-700 mt-2">
            Đổi bác sĩ phụ trách cho lịch hẹn ngày <span className="font-bold text-slate-900">{appt?.slotDate ? format(new Date(appt.slotDate), 'dd/MM/yyyy') : ''}</span> 
            {appt?.specialtyName ? ` (Chuyên khoa: ${appt.specialtyName})` : ''}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800">Chọn bác sĩ</label>
            {availableDoctors.length === 0 ? (
              <p className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded-md border border-red-100">Không có bác sĩ khác cùng chuyên khoa để đổi.</p>
            ) : (
              <Select value={doctorId} onValueChange={(v) => { setDoctorId(v); setSlotId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bác sĩ" />
                </SelectTrigger>
                <SelectContent>
                  {availableDoctors.map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800">Khung giờ trống của bác sĩ mới</label>
            {!doctorId ? (
              <p className="text-sm text-slate-500">Vui lòng chọn bác sĩ trước.</p>
            ) : isLoadingSlots ? (
              <p className="text-sm text-slate-500">Đang tải...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-red-500">Bác sĩ này đã kín lịch trong ngày này.</p>
            ) : (
              <Select value={slotId} onValueChange={setSlotId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giờ khám" />
                </SelectTrigger>
                <SelectContent>
                  {slots.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={assignDoctorMutation.isPending}>Hủy</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirm} disabled={!slotId || !doctorId || assignDoctorMutation.isPending}>
            {assignDoctorMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Đổi bác sĩ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
