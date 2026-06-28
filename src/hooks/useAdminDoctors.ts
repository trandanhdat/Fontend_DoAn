import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../services/doctor.service';
import type { CreateDoctorDto, CreateDoctorWithAccountDto } from '../models/api.model';
import toast from 'react-hot-toast';

export function useAdminDoctors() {
  return useQuery({
    queryKey: ['admin-doctors'],
    queryFn: () => doctorService.getAll(),
  });
}

export function useAdminCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDoctorDto) => doctorService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Thêm hồ sơ bác sĩ thành công');
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[];
        toast.error(firstError[0]);
      } else {
        toast.error(error.response?.data?.message || 'Lỗi khi thêm bác sĩ');
      }
    }
  });
}

export function useAdminCreateDoctorWithAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDoctorWithAccountDto) => doctorService.createWithAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Tạo tài khoản và hồ sơ bác sĩ thành công');
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[];
        toast.error(firstError[0]);
      } else {
        toast.error(error.response?.data?.message || 'Lỗi khi tạo bác sĩ');
      }
    }
  });
}

export function useAdminUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: CreateDoctorDto }) => doctorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Cập nhật hồ sơ bác sĩ thành công');
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[];
        toast.error(firstError[0]);
      } else {
        toast.error(error.response?.data?.message || 'Lỗi cập nhật bác sĩ');
      }
    }
  });
}

export function useAdminDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => doctorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Xóa hồ sơ bác sĩ thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa bác sĩ');
    }
  });
}
