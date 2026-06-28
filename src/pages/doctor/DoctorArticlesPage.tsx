import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, ImageIcon, Eye, Send } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

import {
  useMyArticles, useCreateArticle, useUpdateArticle, useDeleteArticle, useSubmitArticle
} from '../../hooks/useDoctorArticles';
import { useSpecialties } from '../../hooks/usePublicData';
import { articleService } from '../../services/article.service';
import { getImageUrl } from '@/utils/image';
import type { ArticleSummaryDto } from '../../models/api.model';

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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArticleEditor } from '@/components/doctor/ArticleEditor';

const formSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  specialtyId: z.string().min(1, 'Vui lòng chọn chuyên khoa'),
  summary: z.string().max(500, 'Tóm tắt không được vượt quá 500 ký tự').optional(),
  content: z.string().min(20, 'Nội dung phải có ít nhất 20 ký tự'),
});

type FormValues = z.infer<typeof formSchema>;

export default function DoctorArticlesPage() {
  const { data: pagedResult, isLoading } = useMyArticles();
  const { data: specialtiesResult } = useSpecialties();

  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();
  const submitMutation = useSubmitArticle();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleSummaryDto | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<ArticleSummaryDto | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      specialtyId: '',
      summary: '',
      content: '',
    },
  });

  const filteredArticles = useMemo(() => {
    if (!pagedResult?.items) return [];
    return pagedResult.items.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pagedResult, searchTerm, statusFilter]);

  // Open modal for Add
  const handleAddNew = () => {
    setEditingArticle(null);
    setThumbnailUrl(null);
    form.reset({
      title: '',
      specialtyId: '',
      summary: '',
      content: '',
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleEdit = async (article: ArticleSummaryDto) => {
    setEditingArticle(article);
    setThumbnailUrl(article.thumbnailUrl || null);

    // Fetch full detail to get content
    try {
      const detail = await articleService.getByIdForEdit(article.id);
      form.reset({
        title: detail.title,
        specialtyId: detail.specialtyId.toString(),
        summary: detail.summary || '',
        content: detail.content || '',
      });
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Không thể tải chi tiết bài viết');
    }
  };

  // Handle Form Submit
  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        title: data.title,
        specialtyId: parseInt(data.specialtyId),
        summary: data.summary || '',
        content: data.content,
        thumbnailUrl: thumbnailUrl || undefined,
      };

      if (editingArticle) {
        await updateMutation.mutateAsync({ id: editingArticle.id, data: payload });
        toast.success('Cập nhật bài viết thành công');
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success('Tạo bài viết mới thành công');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await articleService.uploadImage(file);
      setThumbnailUrl(res.relativePath); // Save relative path
      toast.success('Tải ảnh lên thành công');
    } catch (error) {
      toast.error('Tải ảnh lên thất bại');
    } finally {
      setUploadingImage(false);
    }
  };

  // Confirm Delete
  const confirmDelete = () => {
    if (!articleToDelete) return;
    deleteMutation.mutate(articleToDelete.id, {
      onSuccess: () => {
        toast.success('Đã xoá bài viết');
        setIsAlertOpen(false);
      },
      onError: () => {
        toast.error('Không thể xoá bài viết lúc này');
      }
    });
  };

  // Handle Submit
  const handleSubmitArticle = (id: number) => {
    submitMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Đã gửi bài viết cho Admin duyệt');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi duyệt');
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Đã xuất bản</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Chờ duyệt</Badge>;
      case 'Draft':
        return <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">Bản nháp</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bài viết của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và soạn thảo các bài viết y khoa</p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#15718E] hover:bg-[#104870]">
          <Plus className="w-4 h-4 mr-2" />
          Viết bài mới
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 flex flex-col sm:flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-[#15718E]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
            {['All', 'Draft', 'Pending', 'Published', 'Rejected'].map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className={`rounded-full ${statusFilter === s ? 'bg-[#15718E] text-white hover:bg-[#104870]' : 'text-slate-600 bg-white'}`}
              >
                {s === 'All' ? 'Tất cả' : s === 'Draft' ? 'Nháp' : s === 'Pending' ? 'Chờ duyệt' : s === 'Published' ? 'Đã duyệt' : 'Từ chối'}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px]">Ảnh</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Chuyên khoa</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lượt xem</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-12 w-16 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      Không tìm thấy bài viết nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map((article) => (
                    <TableRow key={article.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="w-16 h-12 bg-slate-100 rounded overflow-hidden border border-slate-200 flex items-center justify-center">
                          {article.thumbnailUrl ? (
                            <img src={getImageUrl(article.thumbnailUrl)} alt={article.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-800 line-clamp-2 max-w-sm mt-3 border-b-0 border-t-0">
                        {article.title}
                      </TableCell>
                      <TableCell className="text-slate-600">{article.specialtyName}</TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {article.viewCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(article.status === 'Draft' || article.status === 'Rejected') && (
                            <Button
                              variant="ghost" size="icon"
                              onClick={() => handleSubmitArticle(article.id)}
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                              title="Gửi duyệt"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(article)} className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Sửa bài viết">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setArticleToDelete(article); setIsAlertOpen(true); }}
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            title="Xóa bài viết"
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
        </CardContent>
      </Card>

      {/* Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#15718E]">
              {editingArticle ? 'Sửa bài viết' : 'Viết bài mới'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Left Column - Main Info */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                  <Input {...form.register('title')} placeholder="Nhập tiêu đề..." className="bg-white text-slate-800 border-slate-200 focus-visible:ring-[#15718E]" />
                  {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Tóm tắt (tuỳ chọn)</label>
                  <textarea
                    {...form.register('summary')}
                    className="w-full min-h-[80px] p-2 text-sm bg-white text-slate-800 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15718E]/50 focus:border-[#15718E] resize-none"
                    placeholder="Mô tả ngắn gọn nội dung bài viết..."
                  />
                  {form.formState.errors.summary && <p className="text-xs text-red-500">{form.formState.errors.summary.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Nội dung chi tiết <span className="text-red-500">*</span></label>
                  <Controller
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                      <ArticleEditor value={field.value} onChange={field.onChange} />
                    )}
                  />
                  {form.formState.errors.content && <p className="text-xs text-red-500">{form.formState.errors.content.message}</p>}
                </div>
              </div>

              {/* Right Column - Meta Info */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Chuyên khoa <span className="text-red-500">*</span></label>
                  <select
                    {...form.register('specialtyId')}
                    className="w-full h-10 px-3 py-2 bg-white text-slate-800 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#15718E]/50 focus:border-[#15718E]"
                  >
                    <option value="">-- Chọn chuyên khoa --</option>
                    {specialtiesResult?.map((spec: any) => (
                      <option key={spec.id} value={spec.id}>{spec.name}</option>
                    ))}
                  </select>
                  {form.formState.errors.specialtyId && <p className="text-xs text-red-500">{form.formState.errors.specialtyId.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Ảnh thu nhỏ</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative min-h-[160px] bg-slate-50/50">
                    {thumbnailUrl ? (
                      <div className="relative w-full h-32 rounded overflow-hidden group">
                        <img src={getImageUrl(thumbnailUrl)} alt="Thumbnail" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <label className="cursor-pointer text-white text-xs font-medium px-2 py-1 bg-black/40 rounded hover:bg-black/60">
                            Đổi ảnh
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-xs text-slate-500 mb-2">Nhấn để tải ảnh lên (Max 2MB)</span>
                        <label className="cursor-pointer">
                          <span className="text-xs font-medium text-[#15718E] bg-[#15718E]/10 px-3 py-1.5 rounded-md hover:bg-[#15718E]/20">
                            {uploadingImage ? 'Đang tải...' : 'Chọn file'}
                          </span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mt-6">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Lưu ý</h4>
                  <ul className="text-xs text-blue-700 list-disc pl-4 space-y-1">
                    <li>Bài viết sau khi lưu sẽ ở trạng thái <strong>Nháp</strong>.</li>
                    <li>Để được hiển thị công khai, bài viết cần được Admin phê duyệt.</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 mt-6 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploadingImage} className="bg-[#15718E] hover:bg-[#104870]">
                {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu bài viết'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá bài viết <strong className="text-slate-800">"{articleToDelete?.title}"</strong> không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending ? 'Đang xoá...' : 'Xoá bài viết'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
