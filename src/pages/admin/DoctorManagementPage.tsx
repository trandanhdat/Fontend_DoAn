import { useState, useMemo } from 'react';
import { 
  Search, Plus, Edit, Trash2, ShieldCheck, ShieldAlert, Star,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { 
  useAdminDoctors, useAdminCreateDoctor, useAdminCreateDoctorWithAccount, useAdminUpdateDoctor, useAdminDeleteDoctor 
} from '../../hooks/useAdminDoctors';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { specialtyService } from '../../services/specialty.service';
import type { DoctorDto, CreateDoctorDto } from '../../models/api.model';

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

export default function DoctorManagementPage() {
  const { data: doctors, isLoading } = useAdminDoctors();
  const { data: users } = useAdminUsers();
  
  // Lấy danh sách chuyên khoa để gán cho bác sĩ
  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtyService.getAllActive(),
  });

  const createMutation = useAdminCreateDoctor();
  const updateMutation = useAdminUpdateDoctor();
  const deleteMutation = useAdminDeleteDoctor();

  const [searchTerm, setSearchTerm] = useState('');
  
  const [deleteDoctor, setDeleteDoctor] = useState<DoctorDto | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreateNewUser, setIsCreateNewUser] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorDto | null>(null);
  
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  const [formData, setFormData] = useState<CreateDoctorDto>({
    userId: 0,
    specialtyId: 0,
    licenseNumber: '',
    yearsExperience: 0,
    degree: '',
    bio: '',
    consultationFee: 0,
    isActive: true
  });

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];
    return doctors.filter(d => 
      (d.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (d.specialtyName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredDoctors.length / pageSize) || 1;
  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Lọc ra những User có role là Doctor nhưng chưa có hồ sơ bác sĩ
  const availableDoctorUsers = useMemo(() => {
    if (!users || !doctors) return [];
    const existingDoctorUserIds = new Set(doctors.map(d => d.userId));
    return users.filter(u => u.roles.includes('Doctor') && !existingDoctorUserIds.has(u.id));
  }, [users, doctors]);

  const handleDeleteConfirm = () => {
    if (!deleteDoctor) return;
    deleteMutation.mutate(deleteDoctor.id, { onSettled: () => setDeleteDoctor(null) });
  };

  const handleOpenCreate = () => {
    setEditingDoctor(null);
    setIsCreateNewUser(false);
    setAccountData({ email: '', password: '', fullName: '', phone: '' });
    setFormData({
      userId: availableDoctorUsers.length > 0 ? availableDoctorUsers[0].id : 0,
      specialtyId: specialties && specialties.length > 0 ? specialties[0].id : 0,
      licenseNumber: '',
      yearsExperience: 0,
      degree: '',
      bio: '',
      consultationFee: 0,
      isActive: true
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (doctor: DoctorDto) => {
    setEditingDoctor(doctor);
    setFormData({
      userId: doctor.userId,
      specialtyId: doctor.specialtyId,
      licenseNumber: doctor.licenseNumber || '',
      yearsExperience: doctor.experienceYears,
      degree: doctor.degree,
      bio: doctor.bio || '',
      consultationFee: doctor.consultationFee,
      isActive: doctor.isActive
    });
    setIsFormOpen(true);
  };

  const createWithAccountMutation = useAdminCreateDoctorWithAccount();

  const handleFormSubmit = () => {
    if (editingDoctor) {
      updateMutation.mutate({ id: editingDoctor.id, data: formData }, {
        onSuccess: () => setIsFormOpen(false)
      });
    } else {
      if (isCreateNewUser) {
        createWithAccountMutation.mutate({
          email: accountData.email,
          password: accountData.password,
          fullName: accountData.fullName,
          phone: accountData.phone,
          specialtyId: formData.specialtyId,
          licenseNumber: formData.licenseNumber,
          yearsExperience: formData.yearsExperience,
          degree: formData.degree,
          bio: formData.bio,
          consultationFee: formData.consultationFee,
          isActive: formData.isActive
        }, {
          onSuccess: () => setIsFormOpen(false)
        });
      } else {
        createMutation.mutate(formData, {
          onSuccess: () => setIsFormOpen(false)
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Bác sĩ</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách và thông tin chuyên môn của bác sĩ</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm hồ sơ Bác sĩ
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm tên bác sĩ, chuyên khoa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Bác sĩ</TableHead>
                  <TableHead className="font-semibold text-slate-700">Chuyên khoa</TableHead>
                  <TableHead className="font-semibold text-slate-700">Bằng cấp & Kinh nghiệm</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Đánh giá</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Trạng thái</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                      Không tìm thấy bác sĩ nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDoctors.map((d) => (
                    <TableRow key={d.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                            {d.avatarUrl ? (
                              <img src={d.avatarUrl} alt={d.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold">
                                {d.fullName ? d.fullName.charAt(0).toUpperCase() : 'B'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{d.fullName}</p>
                            <p className="text-xs text-slate-500">Giấy phép: {d.licenseNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          {d.specialtyName || 'Chưa phân khoa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-slate-700">{d.degree}</p>
                        <p className="text-xs text-slate-500">{d.experienceYears} năm kinh nghiệm</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-bold text-amber-500">{d.averageRating?.toFixed(1) || '0.0'}</span>
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        </div>
                        <p className="text-[10px] text-slate-400">{d.totalReviews || 0} lượt</p>
                      </TableCell>
                      <TableCell className="text-center">
                        {d.isActive ? (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 gap-1 pl-1.5 justify-center">
                            <ShieldCheck className="w-3 h-3" /> Đang khám
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 gap-1 pl-1.5 justify-center">
                            <ShieldAlert className="w-3 h-3" /> Tạm nghỉ
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleOpenEdit(d)}
                            title="Sửa hồ sơ"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteDoctor(d)}
                            title="Xóa hồ sơ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteDoctor} onOpenChange={(open) => !open && setDeleteDoctor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa hồ sơ bác sĩ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hồ sơ chuyên môn của Bác sĩ <strong>{deleteDoctor?.fullName}</strong>? 
              Thao tác này sẽ không xóa tài khoản người dùng, nhưng sẽ xóa toàn bộ lịch khám, lịch hẹn liên quan đến hồ sơ này. Thao tác không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa hồ sơ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? 'Sửa hồ sơ Bác sĩ' : 'Thêm hồ sơ Bác sĩ'}</DialogTitle>
            <DialogDescription>
              {editingDoctor ? 'Cập nhật thông tin chuyên môn cho bác sĩ' : 'Tạo hồ sơ chuyên môn cho một tài khoản (có quyền Doctor) trong hệ thống'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            {/* Nếu đang tạo mới, cho phép chọn User hoặc tạo User mới */}
            {!editingDoctor && (
              <div className="grid gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="userCreationType"
                      checked={!isCreateNewUser} 
                      onChange={() => setIsCreateNewUser(false)} 
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">Chọn tài khoản có sẵn</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="userCreationType"
                      checked={isCreateNewUser} 
                      onChange={() => setIsCreateNewUser(true)} 
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">Tạo tài khoản mới</span>
                  </label>
                </div>

                {!isCreateNewUser ? (
                  <div className="grid gap-2">
                    <Label htmlFor="userId">Tài khoản User (Chỉ hiển thị các User có Role = Doctor chưa có hồ sơ)</Label>
                    <select 
                      id="userId"
                      value={formData.userId}
                      onChange={(e) => setFormData(f => ({ ...f, userId: Number(e.target.value) }))}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={0} disabled>-- Chọn tài khoản --</option>
                      {availableDoctorUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                      ))}
                    </select>
                    {availableDoctorUsers.length === 0 && (
                      <p className="text-xs text-red-500">Không có tài khoản Doctor nào rảnh. Hãy cấp quyền Doctor cho một User trước, hoặc chọn Tạo tài khoản mới.</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName">Họ và Tên</Label>
                      <Input 
                        id="fullName" 
                        value={accountData.fullName}
                        onChange={(e) => setAccountData(a => ({ ...a, fullName: e.target.value }))}
                        placeholder="Nhập họ tên đầy đủ"
                        className="bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email đăng nhập</Label>
                      <Input 
                        id="email" type="email"
                        autoComplete="off"
                        value={accountData.email}
                        onChange={(e) => setAccountData(a => ({ ...a, email: e.target.value }))}
                        placeholder="doctor@example.com"
                        className="bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Mật khẩu</Label>
                      <Input 
                        id="password" type="password"
                        autoComplete="new-password"
                        value={accountData.password}
                        onChange={(e) => setAccountData(a => ({ ...a, password: e.target.value }))}
                        placeholder="Nhập mật khẩu"
                        className="bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input 
                        id="phone"
                        value={accountData.phone}
                        onChange={(e) => setAccountData(a => ({ ...a, phone: e.target.value }))}
                        placeholder="0912345678"
                        className="bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="specialtyId">Chuyên khoa</Label>
                <select 
                  id="specialtyId"
                  value={formData.specialtyId}
                  onChange={(e) => setFormData(f => ({ ...f, specialtyId: Number(e.target.value) }))}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0} disabled>-- Chọn chuyên khoa --</option>
                  {specialties?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="licenseNumber">Giấy phép hành nghề</Label>
                <Input 
                  id="licenseNumber" 
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData(f => ({ ...f, licenseNumber: e.target.value }))}
                  placeholder="Ví dụ: CCHN-12345"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="degree">Bằng cấp</Label>
                <Input 
                  id="degree" 
                  value={formData.degree}
                  onChange={(e) => setFormData(f => ({ ...f, degree: e.target.value }))}
                  placeholder="ThS. BS, TS. BS..."
                  className="bg-white"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="yearsExperience">Số năm kinh nghiệm</Label>
                <Input 
                  id="yearsExperience" 
                  type="number" min={0}
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData(f => ({ ...f, yearsExperience: Number(e.target.value) }))}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="consultationFee">Phí khám (VNĐ)</Label>
                <Input 
                  id="consultationFee" 
                  type="number" min={0} step={10000}
                  value={formData.consultationFee}
                  onChange={(e) => setFormData(f => ({ ...f, consultationFee: Number(e.target.value) }))}
                  className="bg-white"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="isActive">Trạng thái làm việc</Label>
                <select 
                  id="isActive"
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) => setFormData(f => ({ ...f, isActive: e.target.value === "true" }))}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="true">Đang khám (Active)</option>
                  <option value="false">Tạm nghỉ (Inactive)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Tiểu sử / Giới thiệu</Label>
              <textarea 
                id="bio" 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData(f => ({ ...f, bio: e.target.value }))}
                placeholder="Giới thiệu về chuyên môn, kinh nghiệm của bác sĩ..."
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>Hủy</Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700" 
              onClick={handleFormSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || createWithAccountMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending || createWithAccountMutation.isPending) ? 'Đang lưu...' : 'Lưu thông tin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
