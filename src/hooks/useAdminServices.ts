import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/service.service';
import type { CreateServiceDto } from '../models/api.model';
import toast from 'react-hot-toast';

export function useAdminServices() {
  return useQuery({
    queryKey: ['admin-services'],
    queryFn: () => serviceService.getAll(),
  });
}

export function useAdminCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceDto) => serviceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Thêm dịch vụ thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm dịch vụ');
    }
  });
}

export function useAdminUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: CreateServiceDto }) => serviceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Cập nhật dịch vụ thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật dịch vụ');
    }
  });
}

export function useAdminDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Xóa dịch vụ thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa dịch vụ');
    }
  });
}
