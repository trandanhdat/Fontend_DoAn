import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Search, Users, CheckCircle2, Clock, XCircle, User, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { appointmentService } from "../../services/appointment.service";
import { useCheckIn, useMarkNoShow } from "../../hooks/useDoctorAppointments";
import { CancelModal, RescheduleModal, AssignDoctorModal } from "./ReceptionModals";
import type { AppointmentDto } from "../../models/api.model";

const fmtTime = (t: string) => (t ?? "").slice(0, 5);

export const ReceptionPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedAppt, setSelectedAppt] = useState<AppointmentDto | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [assignDoctorOpen, setAssignDoctorOpen] = useState(false);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["allTodayAppointments", selectedDate],
    queryFn: () => appointmentService.getAllTodayAppointments(selectedDate),
    refetchInterval: 10_000, // Tự động refetch để cập nhật liên tục
  });

  const checkInMutation = useCheckIn();
  const noShowMutation = useMarkNoShow();

  const filteredAppts = appointments.filter((appt) =>
    appt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.patientPhone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tiếp đón bệnh nhân</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và xác nhận Check-in cho tất cả bệnh nhân đến khám trong ngày</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="date"
              className="pl-10 bg-white border-slate-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng số ca khám</p>
              <h3 className="text-2xl font-bold text-slate-800">{appointments.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Đã Check-in</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {appointments.filter(a => a.status === 'CheckedIn' || a.status === 'Completed').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Chưa đến</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-semibold text-slate-800">Danh sách theo lịch</h2>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT bệnh nhân hoặc bác sĩ..."
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm w-full sm:w-80 focus:ring-emerald-500 focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bệnh nhân</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bác sĩ phụ trách</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredAppts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Không có bệnh nhân nào khớp với tìm kiếm trong ngày {format(new Date(selectedDate), "dd/MM/yyyy", { locale: vi })}.
                  </td>
                </tr>
              ) : (
                filteredAppts.map((appt) => {
                  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");
                  const currentTimeStr = format(new Date(), "HH:mm");
                  const isLate = isToday && appt.status === "Confirmed" && fmtTime(appt.startTime) < currentTimeStr;

                  return (
                  <tr key={appt.id} className={`transition-colors ${isLate ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-semibold ${isLate ? 'text-red-600' : 'text-slate-700'}`}>
                        {fmtTime(appt.startTime)}
                        {isLate && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">Trễ hẹn</span>}
                      </div>
                      <div className="text-xs text-slate-500">{fmtTime(appt.endTime)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{appt.patientName || "Bệnh nhân"}</div>
                      <div className="text-xs text-slate-500">{appt.patientPhone || ""}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{appt.doctorName || "Chưa phân công"}</div>
                      <div className="text-xs text-slate-500">{appt.serviceName || appt.specialtyName}</div>
                    </td>
                    <td className="px-6 py-4">
                      {appt.status === "CheckedIn" ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                          Đã đến (Chờ khám) {appt.checkInTime ? `- ` + new Date(appt.checkInTime.endsWith('Z') ? appt.checkInTime : appt.checkInTime + 'Z').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Badge>
                      ) : appt.status === "Examining" ? (
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Đang khám</Badge>
                      ) : appt.status === "Confirmed" ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Chưa đến</Badge>
                      ) : appt.status === "Pending" ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Chờ xác nhận</Badge>
                      ) : appt.status === "Completed" ? (
                        <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 border-none">Hoàn thành</Badge>
                      ) : appt.status === "NoShow" ? (
                        <Badge className="bg-slate-200 text-slate-500 hover:bg-slate-200 border-none">Lỡ hẹn</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Đã hủy</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                      {appt.status === "Confirmed" && (
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => noShowMutation.mutate(appt.id)}
                            disabled={noShowMutation.isPending}
                            className="bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
                            title="Đánh dấu lỡ hẹn"
                          >
                            Lỡ hẹn
                          </Button>
                          <Button
                            onClick={() => checkInMutation.mutate(appt.id)}
                            disabled={checkInMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            title="Xác nhận đã đến"
                          >
                            Đã đến
                          </Button>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 p-0 text-slate-500 hover:bg-slate-100 rounded-md">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-48 p-1">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm text-slate-700 hover:bg-slate-100 font-normal px-2 py-1.5 h-auto"
                                onClick={() => { setSelectedAppt(appt); setAssignDoctorOpen(true); }}
                              >
                                <User className="mr-2 h-4 w-4 text-blue-500" />
                                Đổi bác sĩ
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm text-slate-700 hover:bg-slate-100 font-normal px-2 py-1.5 h-auto"
                                onClick={() => { setSelectedAppt(appt); setRescheduleOpen(true); }}
                              >
                                <Calendar className="mr-2 h-4 w-4 text-amber-500" />
                                Dời lịch hẹn
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 font-normal px-2 py-1.5 h-auto"
                                onClick={() => { setSelectedAppt(appt); setCancelOpen(true); }}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Hủy lịch hẹn
                              </Button>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CancelModal appt={selectedAppt} isOpen={cancelOpen} onClose={() => setCancelOpen(false)} />
      <RescheduleModal appt={selectedAppt} isOpen={rescheduleOpen} onClose={() => setRescheduleOpen(false)} />
      <AssignDoctorModal appt={selectedAppt} isOpen={assignDoctorOpen} onClose={() => setAssignDoctorOpen(false)} />
    </div>
  );
};
