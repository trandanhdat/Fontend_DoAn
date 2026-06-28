import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppointmentDetail } from '../../hooks/useAppointmentDetail';
import { ReviewForm } from '../../components/patient/ReviewForm';
import { ArrowLeft, Calendar, Clock, MapPin, User, Stethoscope, FileText, CheckCircle2, Star, Pencil, Trash2, Phone, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';
import { useDeleteReview } from '../../hooks/useReview';
import { vi } from 'date-fns/locale';

export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appointment, medicalRecord, review, isLoading } = useAppointmentDetail(Number(id));
  const [isEditingReview, setIsEditingReview] = useState(false);
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

  const handleDeleteReview = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
      deleteReview(review!.id);
    }
  };

  const canEditReview = review && review.editCount === 0 && (new Date().getTime() - new Date(review.createdAt).getTime()) <= 7 * 24 * 60 * 60 * 1000;

  if (isLoading) {
    return <div className="p-8 max-w-3xl mx-auto animate-pulse flex flex-col gap-6">
      <div className="h-10 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-64 bg-slate-200 rounded-xl"></div>
      <div className="h-40 bg-slate-200 rounded-xl"></div>
    </div>;
  }

  if (!appointment) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy lịch hẹn.</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6 text-slate-500 hover:text-slate-800 -ml-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
      </Button>

      <div className="space-y-6">
        {/* Basic Appointment Info */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Chi tiết lịch hẹn #{appointment.id}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Trạng thái: <span className={`font-semibold ${appointment.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{appointment.status}</span>
              </p>
            </div>
            {appointment.status === 'Completed' && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Bác sĩ</p>
                <p className="font-medium text-slate-800">{appointment.doctorName || 'Chưa phân công'}</p>
                <p className="text-xs text-slate-500">{appointment.specialtyName}</p>
              </div>
            </div>
            
            {appointment.serviceName && (
              <div className="flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Dịch vụ</p>
                  <p className="font-medium text-slate-800">{appointment.serviceName}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Ngày khám</p>
                <p className="font-medium text-slate-800">
                  {format(new Date(appointment.slotDate), 'EEEE, dd MMMM, yyyy', { locale: vi })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Thời gian</p>
                <p className="font-medium text-slate-800">
                  {appointment.startTime.slice(0, 5)} - {appointment.endTime ? appointment.endTime.slice(0, 5) : ''}
                </p>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 flex items-start gap-3 mt-2 pt-4 border-t border-slate-50">
              <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Lý do khám</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg mt-1">
                  {appointment.reason || <span className="text-slate-400 italic">Không có ghi chú</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Info Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-[#15718E]" /> Thông tin đăng ký khám
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Bệnh nhân</p>
              <p className="font-medium text-slate-800">{appointment.patientName}</p>
            </div>
            {appointment.patientPhone && (
              <div>
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Số điện thoại</p>
                <p className="font-medium text-slate-800">{appointment.patientPhone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Phí dịch vụ (dự kiến)</p>
              <p className="font-medium text-slate-800">
                {appointment.fee ? `${appointment.fee.toLocaleString('vi-VN')} VNĐ` : 'Theo giá dịch vụ thực tế'}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Record Summary (if completed) */}
        {appointment.status === 'Completed' && medicalRecord && (
          <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
            <h2 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Kết quả khám bệnh
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-emerald-700">Chẩn đoán sơ bộ</p>
                <p className="text-sm text-slate-700 bg-white p-3 rounded border border-emerald-50 mt-1">{medicalRecord.diagnosis}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Hướng điều trị</p>
                <p className="text-sm text-slate-700 bg-white p-3 rounded border border-emerald-50 mt-1">{medicalRecord.treatment}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                <a href="/patient/medical-history">Xem chi tiết hồ sơ bệnh án</a>
              </Button>
            </div>
          </div>
        )}

        {/* Review Section */}
        {appointment.status === 'Completed' && (
          <div className="mt-8">
            {review && !isEditingReview ? (
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Đánh giá của bạn</h3>
                  <div className="flex gap-2">
                    {canEditReview && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditingReview(true)} className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Pencil className="w-4 h-4 mr-1" /> Sửa
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleDeleteReview} disabled={isDeleting} className="h-8 text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-1" /> Xóa
                    </Button>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-5 h-5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-slate-700 italic bg-slate-50 p-4 rounded-lg">"{review.comment}"</p>
                <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
                  <span>
                    {review.editCount ? `Đã sửa ${review.editCount} lần` : (canEditReview ? 'Có thể sửa trong vòng 7 ngày kể từ khi tạo' : 'Đã quá hạn sửa')}
                  </span>
                  <span>
                    Đã đánh giá vào {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              </div>
            ) : review && isEditingReview ? (
              <ReviewForm 
                appointmentId={appointment.id} 
                reviewId={review.id}
                initialData={{ rating: review.rating, comment: review.comment }}
                onCancelEdit={() => setIsEditingReview(false)}
                onEditSuccess={() => setIsEditingReview(false)}
              />
            ) : (
              <ReviewForm appointmentId={appointment.id} />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AppointmentDetailPage;
