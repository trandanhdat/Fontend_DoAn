import { useState, useMemo } from 'react';
import { 
  Search, Plus, Edit, Trash2, Stethoscope
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { 
  useAdminServices, useAdminCreateService, useAdminUpdateService, useAdminDeleteService 
} from '../../hooks/useAdminServices';
import { specialtyService } from '../../services/specialty.service';
import type { ServiceResponseDto, CreateServiceDto } from '../../models/api.model';

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function ServiceManagementPage() {
  const { data: services, isLoading } = useAdminServices();
  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtyService.getAllActive(),
  });

  const createMutation = useAdminCreateService();
  const updateMutation = useAdminUpdateService();
  const deleteMutation = useAdminDeleteService();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [deleteItem, setDeleteItem] = useState<ServiceResponseDto | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceResponseDto | null>(null);
  const [formData, setFormData] = useState<CreateServiceDto>({
    specialtyId: 0,
    name: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    isActive: true
  });

  const filteredItems = useMemo(() => {
    if (!services) return [];
    return services.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset trang về 1 khi search
  useMemo(() => setCurrentPage(1), [searchTerm]);

  const handleDeleteConfirm = () => {
    if (!deleteItem) return;
    deleteMutation.mutate(deleteItem.id, { onSettled: () => setDeleteItem(null) });
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      specialtyId: specialties && specialties.length > 0 ? specialties[0].id : 0,
      name: '',
      description: '',
      price: 0,
      durationMinutes: 30,
      isActive: true
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ServiceResponseDto) => {
    setEditingItem(item);
    setFormData({
      specialtyId: item.specialtyId,
      name: item.name,
      description: '', // Ghi chú: DTO Response của service có thể không trả về description đầy đủ, API cần trả về hoặc tạm để trống
      price: item.price,
      durationMinutes: item.durationMinutes,
      isActive: item.isActive
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData }, {
        onSuccess: () => setIsFormOpen(false)
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setIsFormOpen(false)
      });
    }
  };

  const getSpecialtyName = (specialtyId: number) => {
    return specialties?.find(s => s.id === specialtyId)?.name || 'Không rõ';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Dịch vụ</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách dịch vụ khám chữa bệnh</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm Dịch vụ
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm tên dịch vụ..." 
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
                  <TableHead className="font-semibold text-slate-700">Tên dịch vụ</TableHead>
                  <TableHead className="font-semibold text-slate-700">Chuyên khoa</TableHead>
                  <TableHead className="font-semibold text-slate-700">Giá & Thời lượng</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Trạng thái</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      Không tìm thấy dịch vụ nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 flex-shrink-0">
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-semibold text-slate-800">{s.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {getSpecialtyName(s.specialtyId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-amber-600">{formatCurrency(s.price)}</p>
                        <p className="text-xs text-slate-500">{s.durationMinutes} phút</p>
                      </TableCell>
                      <TableCell className="text-center">
                        {s.isActive ? (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                            Đã ẩn
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleOpenEdit(s)}
                            title="Sửa dịch vụ"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteItem(s)}
                            title="Xóa dịch vụ"
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
          {totalPages > 1 && (
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
      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa dịch vụ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ <strong>{deleteItem?.name}</strong>? 
              Thao tác không thể hoàn tác nếu không có lịch khám nào đang gắn với dịch vụ này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa dịch vụ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Sửa Dịch vụ' : 'Thêm Dịch vụ'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Cập nhật thông tin dịch vụ khám' : 'Tạo mới một dịch vụ và gắn vào chuyên khoa'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid gap-2">
              <Label htmlFor="specialtyId">Thuộc Chuyên khoa</Label>
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
              <Label htmlFor="name">Tên dịch vụ</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Ví dụ: Khám nội tổng quát"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Giá tiền (VNĐ)</Label>
                <Input 
                  id="price" 
                  type="number" min={0} step={10000}
                  value={formData.price}
                  onChange={(e) => setFormData(f => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="durationMinutes">Thời lượng (phút)</Label>
                <Input 
                  id="durationMinutes" 
                  type="number" min={15} step={15}
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData(f => ({ ...f, durationMinutes: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isActive">Trạng thái</Label>
              <select 
                id="isActive"
                value={formData.isActive ? "true" : "false"}
                onChange={(e) => setFormData(f => ({ ...f, isActive: e.target.value === "true" }))}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="true">Hiển thị (Active)</option>
                <option value="false">Ẩn (Inactive)</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <textarea 
                id="description" 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả về dịch vụ này..."
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>Hủy</Button>
            <Button 
              onClick={handleFormSubmit} 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={createMutation.isPending || updateMutation.isPending || !formData.name || formData.specialtyId === 0}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu dịch vụ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
