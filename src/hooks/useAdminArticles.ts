import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleService } from '../services/article.service';
import toast from 'react-hot-toast';

export function useAdminArticles(query: { page?: number; pageSize?: number; keyword?: string; status?: string } = {}) {
  return useQuery({
    queryKey: ['admin-articles', query],
    queryFn: () => articleService.getAdminAll(query),
  });
}

export function useAdminPublishArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => articleService.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Đã duyệt bài viết');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi duyệt bài');
    }
  });
}

export function useAdminRejectArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => articleService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Đã từ chối bài viết');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi từ chối bài');
    }
  });
}

export function useAdminDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => articleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Xóa bài viết thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa bài viết');
    }
  });
}
