import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { specialtyService } from '../services/specialty.service';
import type { CreateSpecialtyDto } from '../models/api.model';
import toast from 'react-hot-toast';

export function useAdminSpecialties() {
  return useQuery({
    queryKey: ['admin-specialties'],
    queryFn: () => specialtyService.getAll(),
  });
}

export function useAdminCreateSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSpecialtyDto) => specialtyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-specialties'] });
      toast.success('Thêm chuyên khoa thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm chuyên khoa');
    }
  });
}

export function useAdminUpdateSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: CreateSpecialtyDto }) => specialtyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-specialties'] });
      toast.success('Cập nhật chuyên khoa thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật chuyên khoa');
    }
  });
}

export function useAdminDeleteSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => specialtyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-specialties'] });
      toast.success('Xóa chuyên khoa thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa chuyên khoa');
    }
  });
}
