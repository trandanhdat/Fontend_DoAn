import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { AdminUpdateUserDto } from '../models/api.model';
import toast from 'react-hot-toast';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userService.getAllUsers(),
  });
}

export function useAdminLockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.lockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã khóa tài khoản thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi khóa tài khoản');
    }
  });
}

export function useAdminUnlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.unlockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã mở khóa tài khoản thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi mở khóa tài khoản');
    }
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: AdminUpdateUserDto }) => userService.adminUpdateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Cập nhật tài khoản thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật tài khoản');
    }
  });
}
