import { useState, useMemo } from 'react';
import { 
  Search, ShieldAlert, ShieldCheck, Edit, UserX, UserCheck,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

import { 
  useAdminUsers, useAdminLockUser, useAdminUnlockUser, useAdminUpdateUser 
} from '../../hooks/useAdminUsers';
import type { UserDetailDto } from '../../models/api.model';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function UserManagementPage() {
  const { data: users, isLoading, error } = useAdminUsers();
  if (error) console.error("Error fetching users:", error);

  const lockMutation = useAdminLockUser();
  const unlockMutation = useAdminUnlockUser();
  const updateMutation = useAdminUpdateUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  const [actionUser, setActionUser] = useState<{ user: UserDetailDto, action: 'lock' | 'unlock' } | null>(null);
  const [editUser, setEditUser] = useState<UserDetailDto | null>(null);
  
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', status: '' });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const matchName = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === 'All' || u.roles.includes(roleFilter);
      return matchName && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const handleActionConfirm = () => {
    if (!actionUser) return;
    if (actionUser.action === 'lock') {
      lockMutation.mutate(actionUser.user.id, { onSettled: () => setActionUser(null) });
    } else {
      unlockMutation.mutate(actionUser.user.id, { onSettled: () => setActionUser(null) });
    }
  };

  const handleEditOpen = (user: UserDetailDto) => {
    setEditUser(user);
    setEditForm({ fullName: user.fullName, phone: user.phone, status: user.status });
  };

  const handleEditSubmit = () => {
    if (!editUser) return;
    updateMutation.mutate({
      id: editUser.id,
      data: editForm
    }, {
      onSuccess: () => setEditUser(null)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Người dùng</h1>
        <p className="text-sm text-slate-500 mt-1">Danh sách tất cả tài khoản trong hệ thống</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 flex flex-col sm:flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm tên hoặc email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
            {['All', 'Admin', 'Doctor', 'Patient'].map(r => (
              <Button
                key={r}
                variant={roleFilter === r ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter(r)}
                className={roleFilter === r ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-slate-600'}
              >
                {r === 'All' ? 'Tất cả' : r}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Người dùng</TableHead>
                  <TableHead className="font-semibold text-slate-700">Liên hệ</TableHead>
                  <TableHead className="font-semibold text-slate-700">Vai trò</TableHead>
                  <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-slate-700">Ngày tạo</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold">
                                {u.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{u.fullName}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{u.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.map(r => (
                            <Badge key={r} variant="outline" className={`text-[10px] ${r === 'Admin' ? 'border-purple-200 bg-purple-50 text-purple-700' : r === 'Doctor' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.status === 'Locked' ? (
                          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 gap-1 pl-1.5">
                            <ShieldAlert className="w-3 h-3" /> Bị khóa
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 gap-1 pl-1.5">
                            <ShieldCheck className="w-3 h-3" /> Hoạt động
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {format(new Date(u.createdAt), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleEditOpen(u)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {u.status === 'Locked' ? (
                            <Button 
                              variant="ghost" size="icon" 
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => setActionUser({ user: u, action: 'unlock' })}
                              title="Mở khóa tài khoản"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" size="icon" 
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => setActionUser({ user: u, action: 'lock' })}
                              title="Khóa tài khoản"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Phân trang */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <div className="text-sm font-medium text-slate-600">
                Trang {currentPage} / {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lock/Unlock Dialog */}
      <AlertDialog open={!!actionUser} onOpenChange={(open) => !open && setActionUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionUser?.action === 'lock' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionUser?.action === 'lock' 
                ? `Bạn có chắc chắn muốn KHÓA tài khoản của ${actionUser?.user.fullName}? Người này sẽ không thể đăng nhập vào hệ thống.`
                : `Bạn có chắc chắn muốn MỞ KHÓA tài khoản của ${actionUser?.user.fullName}? Người này có thể đăng nhập trở lại.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={lockMutation.isPending || unlockMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleActionConfirm}
              className={actionUser?.action === 'lock' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}
              disabled={lockMutation.isPending || unlockMutation.isPending}
            >
              {lockMutation.isPending || unlockMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cơ bản cho {editUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input 
                id="fullName" 
                value={editForm.fullName}
                onChange={(e) => setEditForm(f => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input 
                id="phone" 
                value={editForm.phone}
                onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <select 
                id="status"
                value={editForm.status}
                onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <option value="Active">Active (Hoạt động)</option>
                <option value="Locked">Locked (Bị khóa)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)} disabled={updateMutation.isPending}>Hủy</Button>
            <Button 
              onClick={handleEditSubmit} 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={updateMutation.isPending || !editForm.fullName || !editForm.phone}
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
