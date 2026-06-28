import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { X, Calendar, Clock, Stethoscope, User } from "lucide-react";
import toast from "react-hot-toast";

import { doctorService } from "../../services/doctor.service";
import { scheduleService } from "../../services/schedule.service";
import { appointmentService } from "../../services/appointment.service";
import type { AppointmentDto, DoctorDto, TimeSlotDto } from "../../models/api.model";

interface Props {
  appointment: AppointmentDto;
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignDoctorModal: React.FC<Props> = ({ appointment, onClose, onAssigned }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | "">("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | "">("");
  const queryClient = useQueryClient();

  // Load doctors for this specialty
  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["doctorsBySpecialty", appointment.specialtyId],
    queryFn: () => {
      if (!appointment.specialtyId) return Promise.resolve([]);
      return doctorService.getBySpecialty(appointment.specialtyId);
    },
    enabled: !!appointment.specialtyId
  });

  // Load available slots for selected doctor on appointment date
  const { data: slots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ["availableSlots", selectedDoctorId, appointment.slotDate],
    queryFn: () => {
      if (!selectedDoctorId) return Promise.resolve([]);
      return scheduleService.getAvailableSlots(Number(selectedDoctorId), appointment.slotDate);
    },
    enabled: !!selectedDoctorId
  });

  const assignMutation = useMutation({
    mutationFn: (data: { doctorId: number; timeSlotId: number }) => {
      return appointmentService.assignDoctor(appointment.id, data);
    },
    onSuccess: () => {
      toast.success("Đã phân công bác sĩ thành công!");
      queryClient.invalidateQueries({ queryKey: ["generalAppointments"] });
      onAssigned();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi phân công bác sĩ.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedSlotId) {
      toast.error("Vui lòng chọn bác sĩ và khung giờ!");
      return;
    }
    assignMutation.mutate({
      doctorId: Number(selectedDoctorId),
      timeSlotId: Number(selectedSlotId)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Phân công Bác sĩ</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <User className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Bệnh nhân:</span> {appointment.patientName}
            </p>
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Chuyên khoa:</span> {appointment.specialtyName || "Chưa rõ"}
            </p>
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Ngày hẹn:</span> {format(new Date(appointment.slotDate), "dd/MM/yyyy")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Chọn Bác sĩ
              </label>
              <select
                className="w-full border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value ? Number(e.target.value) : "");
                  setSelectedSlotId(""); // Reset slot when doctor changes
                }}
                disabled={isLoadingDoctors}
              >
                <option value="">-- Chọn Bác sĩ --</option>
                {doctors.map((doc: DoctorDto) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Chọn Khung giờ khám
              </label>
              <select
                className="w-full border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value ? Number(e.target.value) : "")}
                disabled={!selectedDoctorId || isLoadingSlots}
              >
                <option value="">-- Chọn khung giờ --</option>
                {slots.map((slot: TimeSlotDto) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </select>
              {selectedDoctorId && slots.length === 0 && !isLoadingSlots && (
                <p className="text-xs text-red-500 mt-1">Bác sĩ này không còn khung giờ trống trong ngày hẹn.</p>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={assignMutation.isPending || !selectedDoctorId || !selectedSlotId}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
              >
                {assignMutation.isPending ? "Đang xử lý..." : "Xác nhận Phân công"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
