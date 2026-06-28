import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInYears } from 'date-fns';
import {
  Search,
  ChevronRight,
  Printer,
  Plus,
  Stethoscope,
  CalendarDays,
  FileText,
  Activity,
  ClipboardList,
  ChevronLeft,
  AlertCircle,
  Droplets,
  Phone,
  User as UserIcon,
  Pill,
  Clock,
  Paperclip
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/store/auth.store';
import { patientService } from '@/services/patient.service';
import { medicalRecordService } from '@/services/medical-record.service';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function PatientRecordsPage() {
  const { user } = useAuthStore();
  const doctorId = user?.doctorId || 0;
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 8;

  // Reset pagination when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Lấy danh sách bệnh nhân của bác sĩ
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['doctor-patients', doctorId],
    queryFn: () => patientService.getDoctorPatients(doctorId),
  });

  // Lọc bệnh nhân theo tìm kiếm
  const filteredPatients = patients?.filter((p) =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính toán phân trang
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients?.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil((filteredPatients?.length || 0) / patientsPerPage);

  // Khi có danh sách bệnh nhân, tự động chọn người đầu tiên
  useEffect(() => {
    if (patients && patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].patientId);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient = patients?.find((p) => p.patientId === selectedPatientId);

  // Lấy lịch sử khám của bệnh nhân được chọn
  const { data: records, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['patient-records', selectedPatientId],
    queryFn: () => medicalRecordService.getPatientRecords(selectedPatientId!),
    enabled: !!selectedPatientId,
  });

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const getAge = (dob: string | null | undefined) => {
    if (!dob) return 'N/A';
    return differenceInYears(new Date(), new Date(dob)) + ' tuổi';
  };

  const getGenderIcon = (gender: number | string | undefined) => {
    if (gender === 'Male' || gender === 0) return '♂ Nam';
    if (gender === 'Female' || gender === 1) return '♀ Nữ';
    return 'Khác';
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden bg-slate-50/50">

      {/* ─── Cột trái: Danh sách bệnh nhân ──────────────────────────────── */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white shadow-sm z-10">
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Tìm kiếm bệnh nhân..."
              className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-[#15718E] rounded-xl h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoadingPatients ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : currentPatients?.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <UserIcon className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">Không tìm thấy bệnh nhân nào.</p>
            </div>
          ) : (
            <div className="p-3 space-y-1.5">
              {currentPatients?.map((p) => {
                const isSelected = p.patientId === selectedPatientId;
                return (
                  <div
                    key={p.patientId}
                    onClick={() => setSelectedPatientId(p.patientId)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                        : 'bg-white border border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-11 w-11 border-2 ${isSelected ? 'border-white shadow-sm' : 'border-slate-100'}`}>
                        <AvatarImage src={p.avatarUrl} alt={p.fullName} />
                        <AvatarFallback className={isSelected ? "bg-[#15718E] text-white" : "bg-slate-100 text-slate-600 font-medium"}>
                          {p.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-[#15718E]' : 'text-slate-700'}`}>
                          {p.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {getGenderIcon(p.gender)} • {getAge(p.dateOfBirth)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-[#15718E]' : 'text-slate-300'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ─── Cột phải: Chi tiết hồ sơ ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />

        {selectedPatient ? (
          <>
            {/* Header chi tiết bệnh nhân (EMR Summary Board) */}
            <div className="px-8 py-6 border-b border-slate-200 bg-white z-10 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)]">
              
              <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                {/* Left: Basic Info */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar className="h-20 w-20 shadow-md border-4 border-white">
                      <AvatarImage src={selectedPatient.avatarUrl} alt={selectedPatient.fullName} className="object-cover" />
                      <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-[#104870] to-[#2b88aa] text-white">
                        {selectedPatient.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Online" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 mb-1.5 tracking-tight">{selectedPatient.fullName}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-semibold px-2.5 py-0.5 text-xs rounded-md">
                        Mã BN: {selectedPatient.patientCode || `#${selectedPatient.patientId}`}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-semibold px-2.5 py-0.5 text-xs rounded-md">
                        {getGenderIcon(selectedPatient.gender)}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-semibold px-2.5 py-0.5 text-xs rounded-md">
                        {getAge(selectedPatient.dateOfBirth)} ({formatDate(selectedPatient.dateOfBirth || '')})
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 self-start">
                  <Button
                    className="gap-2 bg-gradient-to-r from-[#15718E] to-[#105d76] hover:from-[#105d76] hover:to-[#0a3f52] text-white shadow-md font-semibold rounded-xl h-10 px-4 transition-all"
                    onClick={() => {
                      toast('Vui lòng chọn một Lịch hẹn ở trạng thái "Đã xác nhận" từ Bảng điều khiển để tạo hồ sơ.', { icon: 'ℹ️' });
                      navigate('/doctor/dashboard');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm Bệnh Án
                  </Button>
                </div>
              </div>

              {/* Medical Alerts (Bottom of Summary Board) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-xl flex items-center gap-3 transition-colors hover:bg-rose-50">
                  <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-0.5">Nhóm máu</p>
                    <p className="text-sm font-bold text-rose-700 truncate">{selectedPatient.bloodType || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="bg-orange-50/50 border border-orange-100 p-3.5 rounded-xl flex items-center gap-3 transition-colors hover:bg-orange-50">
                  <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-orange-400 mb-0.5">Dị ứng</p>
                    <p className="text-sm font-bold text-orange-700 truncate">{selectedPatient.allergies || 'Không có ghi nhận'}</p>
                  </div>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl flex items-center gap-3 transition-colors hover:bg-indigo-50">
                  <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-0.5">Bệnh nền</p>
                    <p className="text-sm font-bold text-indigo-700 truncate">{selectedPatient.chronicDiseases || 'Không có ghi nhận'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3 transition-colors hover:bg-slate-100">
                  <div className="h-10 w-10 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Liên hệ khẩn cấp</p>
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {selectedPatient.emergencyContactName ? `${selectedPatient.emergencyContactName} - ${selectedPatient.emergencyContactPhone}` : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Khung Timeline */}
            <ScrollArea className="flex-1 px-8 py-8 z-10">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2.5 tracking-tight">
                    <div className="h-8 w-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    Lịch sử Khám bệnh
                  </h3>
                  <Badge variant="outline" className="text-slate-500 font-semibold px-3 py-1 bg-white">
                    {records?.length || 0} hồ sơ
                  </Badge>
                </div>

                {isLoadingRecords ? (
                  <div className="space-y-6">
                    {[1, 2].map((i) => (
                      <Card key={i} className="border-none shadow-md rounded-2xl">
                        <CardContent className="p-6">
                          <Skeleton className="h-6 w-1/3 mb-4" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-5/6 mb-6" />
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <Skeleton className="h-4 w-1/2 mb-2" />
                              <Skeleton className="h-16 w-full" />
                            </div>
                            <div>
                              <Skeleton className="h-4 w-1/2 mb-2" />
                              <Skeleton className="h-16 w-full" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : records?.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Chưa có hồ sơ y tế</h3>
                    <p className="text-slate-500 font-medium">Bệnh nhân này chưa có dữ liệu khám bệnh nào trong hệ thống.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-blue-100 ml-5 pl-8 space-y-10 pb-12">
                    {records?.map((record) => (
                      <div key={record.id} className="relative group">
                        {/* Timeline Node */}
                        <div className="absolute -left-[43px] h-5 w-5 bg-white border-4 border-[#15718E] rounded-full shadow-sm group-hover:scale-125 transition-transform" />

                        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-white">
                          
                          {/* Card Header */}
                          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                                <CalendarDays className="h-4 w-4 text-[#15718E]" />
                                <span className="text-slate-700 font-bold">{formatDate(record.appointmentDate)}</span>
                              </div>
                              <span className="hidden sm:inline-block text-slate-300">•</span>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <UserIcon className="h-4 w-4 text-slate-400" />
                                BS. {record.doctorName}
                              </div>
                            </div>
                            {record.serviceName && (
                              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">
                                {record.serviceName}
                              </Badge>
                            )}
                          </div>

                          {/* Diagnosis Alert */}
                          <div className="px-6 pt-5 pb-2">
                            <h4 className="text-xl font-black text-slate-800 flex items-start gap-2.5">
                              <div className="mt-1 flex-shrink-0 h-2 w-2 rounded-full bg-rose-500" />
                              <span className="leading-tight">CĐ: {record.diagnosis}</span>
                            </h4>
                          </div>

                          {/* Card Body */}
                          <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Symptoms & Notes */}
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5" />
                                  Triệu chứng lâm sàng
                                </h5>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                                  {record.symptoms || 'Không có ghi chú triệu chứng.'}
                                </div>
                              </div>
                              {record.notes && (
                                <div>
                                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Ghi chú thêm</h5>
                                  <p className="text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3 py-0.5">
                                    {record.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Treatment Plan */}
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                  <Pill className="h-3.5 w-3.5" />
                                  Phác đồ điều trị
                                </h5>
                                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 text-sm text-emerald-900 leading-relaxed font-medium whitespace-pre-wrap shadow-inner">
                                  {record.treatment}
                                </div>
                              </div>

                              {record.attachments && (
                                <div>
                                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                    <Paperclip className="h-3.5 w-3.5" />
                                    Tệp đính kèm
                                  </h5>
                                  <Button variant="outline" size="sm" className="h-8 gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
                                    <Paperclip className="h-3.5 w-3.5" />
                                    Xem kết quả cận lâm sàng
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>

                          {/* Follow-up Banner */}
                          {record.followUpDate && (
                            <div className="bg-amber-50 px-6 py-3.5 border-t border-amber-100 flex items-center justify-between">
                              <div className="flex items-center text-sm text-amber-700 font-bold gap-2">
                                <Clock className="h-4 w-4" />
                                Hẹn tái khám: {formatDate(record.followUpDate)}
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <ClipboardList className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Chọn một bệnh nhân để xem chi tiết</p>
          </div>
        )}
      </div>

    </div>
  );
}
