import { useState, useMemo } from 'react';
import { 
  Search, Plus, Edit, Trash2, HeartPulse
} from 'lucide-react';

import { 
  useAdminSpecialties, useAdminCreateSpecialty, useAdminUpdateSpecialty, useAdminDeleteSpecialty 
} from '../../hooks/useAdminSpecialties';
import type { SpecialtyResponseDto, CreateSpecialtyDto } from '../../models/api.model';

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

export default function SpecialtyManagementPage() {
  const { data: specialties, isLoading } = useAdminSpecialties();

  const createMutation = useAdminCreateSpecialty();
  const updateMutation = useAdminUpdateSpecialty();
  const deleteMutation = useAdminDeleteSpecialty();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [deleteItem, setDeleteItem] = useState<SpecialtyResponseDto | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SpecialtyResponseDto | null>(null);
  const [formData, setFormData] = useState<CreateSpecialtyDto>({
    name: '',
    description: '',
    iconUrl: '',
    isActive: true
  });

  const filteredItems = useMemo(() => {
    if (!specialties) return [];
    return specialties.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [specialties, searchTerm]);

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
      name: '',
      description: '',
      iconUrl: '',
      isActive: true
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: SpecialtyResponseDto) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      iconUrl: item.iconUrl || '',
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Chuyên khoa</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách chuyên khoa tại phòng khám</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm Chuyên khoa
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm tên chuyên khoa..." 
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
                  <TableHead className="font-semibold text-slate-700">Chuyên khoa</TableHead>
                  <TableHead className="font-semibold text-slate-700">Mô tả</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Trạng thái</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                      Không tìm thấy chuyên khoa nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex-shrink-0 flex items-center justify-center border border-emerald-100 overflow-hidden">
                            {s.iconUrl ? (
                              <img src={s.iconUrl} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <HeartPulse className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                          <span className="font-semibold text-slate-800">{s.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600 line-clamp-2 max-w-md">{s.description}</p>
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
                            title="Sửa chuyên khoa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteItem(s)}
                            title="Xóa chuyên khoa"
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
            <AlertDialogTitle>Xóa chuyên khoa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chuyên khoa <strong>{deleteItem?.name}</strong>? 
              Lưu ý: Không thể xóa chuyên khoa nếu đang có bác sĩ hoặc dịch vụ phụ thuộc vào chuyên khoa này. Thao tác không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa chuyên khoa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Sửa Chuyên khoa' : 'Thêm Chuyên khoa'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Cập nhật thông tin chuyên khoa hiện tại' : 'Tạo mới một chuyên khoa để phân loại bác sĩ và dịch vụ'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid gap-2">
              <Label htmlFor="name">Tên chuyên khoa</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Ví dụ: Khoa Nội, Khoa Nhi..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="iconUrl">Đường dẫn Icon (Tùy chọn)</Label>
              <Input 
                id="iconUrl" 
                value={formData.iconUrl}
                onChange={(e) => setFormData(f => ({ ...f, iconUrl: e.target.value }))}
                placeholder="https://..."
              />
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
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả về chuyên khoa này..."
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>Hủy</Button>
            <Button 
              onClick={handleFormSubmit} 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={createMutation.isPending || updateMutation.isPending || !formData.name}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu chuyên khoa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
