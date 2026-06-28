import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, Loader2, MessageSquareHeart } from 'lucide-react';
import { RatingStars } from '../ui/RatingStars';
import { useAddReview, useUpdateReview } from '../../hooks/useReview';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn số sao đánh giá.').max(5),
  comment: z.string().min(10, 'Bình luận phải có ít nhất 10 ký tự.').max(500, 'Bình luận tối đa 500 ký tự.'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  appointmentId: number;
  reviewId?: number;
  initialData?: { rating: number; comment: string };
  onCancelEdit?: () => void;
  onEditSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ appointmentId, reviewId, initialData, onCancelEdit, onEditSuccess }) => {
  const { mutate: addReview, isPending: isAdding } = useAddReview();
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview();
  const isPending = isAdding || isUpdating;
  const isEditMode = !!reviewId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: initialData?.rating || 0,
      comment: initialData?.comment || '',
    }
  });

  const ratingValue = watch('rating');

  const onSubmit = (data: ReviewFormValues) => {
    if (isEditMode && reviewId) {
      updateReview({ reviewId, data }, { onSuccess: onEditSuccess });
    } else {
      addReview({
        appointmentId,
        rating: data.rating,
        comment: data.comment,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquareHeart className="w-5 h-5 text-[#15718E]" />
        <h3 className="text-lg font-bold text-slate-800">Đánh giá Bác sĩ</h3>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Hãy chia sẻ trải nghiệm khám bệnh của bạn. Đánh giá của bạn giúp bác sĩ cải thiện chất lượng dịch vụ và giúp những bệnh nhân khác có thêm thông tin tham khảo.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Mức độ hài lòng của bạn <span className="text-red-500">*</span>
          </label>
          <RatingStars 
            rating={ratingValue} 
            interactive={true} 
            size={32}
            onRatingChange={(val) => setValue('rating', val, { shouldValidate: true })} 
          />
          {errors.rating && (
            <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nhận xét chi tiết <span className="text-red-500">*</span>
          </label>
          <Textarea
            {...register('comment')}
            rows={4}
            placeholder="Bác sĩ tư vấn rất nhiệt tình, phòng khám sạch sẽ..."
            className="w-full resize-none"
          />
          {errors.comment && (
            <p className="text-red-500 text-xs mt-1">{errors.comment.message}</p>
          )}
        </div>

        <div className="flex gap-4">
          {isEditMode && (
             <Button
               type="button"
               onClick={onCancelEdit}
               variant="outline"
               className="flex-1 py-6 rounded-xl"
             >
               Hủy
             </Button>
          )}
          <Button
            type="submit"
            disabled={isPending || ratingValue === 0}
            className="flex-1 py-6 bg-[#15718E] hover:bg-[#105d76] text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> {isEditMode ? 'Đang lưu...' : 'Đang gửi...'}
              </>
            ) : (
              isEditMode ? 'Lưu thay đổi' : 'Gửi đánh giá'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
