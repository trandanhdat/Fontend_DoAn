import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';
import type { CreateReviewDto, UpdateReviewDto } from '../models/api.model';
import toast from 'react-hot-toast';

export const useReviewByDoctor = (doctorId: number) => {
  return useQuery({
    queryKey: ['reviews', 'doctor', doctorId],
    queryFn: () => reviewService.getByDoctor(doctorId),
    enabled: !!doctorId,
  });
};

export const useReviewByAppointment = (appointmentId: number) => {
  return useQuery({
    queryKey: ['reviews', 'appointment', appointmentId],
    queryFn: () => reviewService.getByAppointment(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewDto) => reviewService.createReview(data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['reviews', 'appointment', variables.appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'doctor'] }); // Invalidates all doctor reviews to be safe, or we could pass doctorId
      toast.success('Gửi đánh giá thành công! Cảm ơn bạn đã đóng góp.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    }
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: number; data: UpdateReviewDto }) => 
      reviewService.updateReview(reviewId, data),
    onSuccess: (updatedReview) => {
      queryClient.setQueryData(['reviews', 'appointment', updatedReview.appointmentId], updatedReview);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Cập nhật đánh giá thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đánh giá.');
    }
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Xóa đánh giá thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá.');
    }
  });
};
