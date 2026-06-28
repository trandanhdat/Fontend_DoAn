import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageSquareOff, Loader2 } from 'lucide-react';
import { useReviewByDoctor } from '../../hooks/useReview';
import { RatingStars } from '../ui/RatingStars';

interface ReviewListProps {
  doctorId: number;
}

export const ReviewList: React.FC<ReviewListProps> = ({ doctorId }) => {
  const { data: reviews, isLoading, isError } = useReviewByDoctor(doctorId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#15718E] animate-spin mb-4" />
        <p className="text-slate-500">Đang tải đánh giá...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
        Đã có lỗi xảy ra khi tải danh sách đánh giá.
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
        <MessageSquareOff className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Bác sĩ này chưa có đánh giá nào.</p>
        <p className="text-slate-400 text-sm mt-1">Hãy là người đầu tiên để lại đánh giá sau khi khám bệnh nhé!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{review.reviewerName}</h4>
                <span className="text-xs text-slate-400">
                  {format(new Date(review.createdAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                </span>
              </div>
              <RatingStars rating={review.rating} size={14} />
            </div>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
