import { useState, useMemo, useEffect } from 'react';
import { 
  Search, CheckCircle, XCircle, Trash2, FileText, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

import { useQuery } from '@tanstack/react-query';
import { 
  useAdminArticles, useAdminPublishArticle, useAdminRejectArticle, useAdminDeleteArticle 
} from '../../hooks/useAdminArticles';
import { articleService } from '../../services/article.service';
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
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';

export default function ArticleManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset page when searching
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: pagedResult, isLoading } = useAdminArticles({
    page: currentPage,
    pageSize: 10,
    keyword: debouncedSearch || undefined,
    status: statusFilter !== 'All' ? statusFilter : undefined
  });

  const publishMutation = useAdminPublishArticle();
  const rejectMutation = useAdminRejectArticle();
  const deleteMutation = useAdminDeleteArticle();

  const [actionItem, setActionItem] = useState<{ article: ArticleSummaryDto, action: 'publish' | 'reject' | 'delete' } | null>(null);
  const [previewArticleId, setPreviewArticleId] = useState<number | null>(null);

  const { data: previewDetail, isLoading: isPreviewLoading } = useQuery({
    queryKey: ['articleDetail', previewArticleId],
    queryFn: () => articleService.getByIdForEdit(previewArticleId!),
    enabled: !!previewArticleId
  });

  const filteredArticles = useMemo(() => {
    if (!pagedResult?.items) return [];
    return pagedResult.items;
  }, [pagedResult]);

  const handleActionConfirm = () => {
    if (!actionItem) return;
    const { article, action } = actionItem;
    
    const options = { onSettled: () => setActionItem(null) };
    
    if (action === 'publish') {
      publishMutation.mutate(article.id, options);
    } else if (action === 'reject') {
      rejectMutation.mutate(article.id, options);
    } else if (action === 'delete') {
      deleteMutation.mutate(article.id, options);
    }
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Duyệt Bài viết</h1>
          <p className="text-sm text-slate-500 mt-1">Kiểm duyệt các bài viết do bác sĩ đăng tải</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 flex flex-col sm:flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm tiêu đề hoặc tác giả..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
            {['All', 'Pending', 'Published', 'Rejected', 'Draft'].map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={statusFilter === s ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-slate-600'}
              >
                {s === 'All' ? 'Tất cả' : s === 'Pending' ? 'Chờ duyệt' : s === 'Published' ? 'Đã duyệt' : s === 'Rejected' ? 'Từ chối' : 'Nháp'}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Bài viết</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tác giả</TableHead>
                  <TableHead className="font-semibold text-slate-700">Thời gian</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Trạng thái</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      Không tìm thấy bài viết nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map((a) => (
                    <TableRow key={a.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0">
                            <FileText className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <button onClick={() => setPreviewArticleId(a.id)} className="font-semibold text-left text-slate-800 hover:text-emerald-600 flex items-center gap-1 group">
                              {a.title}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{a.specialtyName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-700">{a.authorName}</TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600">
                          {a.publishedAt ? format(new Date(a.publishedAt), 'dd/MM/yyyy HH:mm') : '-'}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(a.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {a.status === 'Pending' && (
                            <>
                              <Button 
                                variant="ghost" size="icon" 
                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => setActionItem({ article: a, action: 'publish' })}
                                title="Duyệt bài"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" size="icon" 
                                className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                                onClick={() => setActionItem({ article: a, action: 'reject' })}
                                title="Từ chối"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => setActionItem({ article: a, action: 'delete' })}
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

          {/* Phân trang */}
          {pagedResult && pagedResult.totalPages > 1 && (
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
                Trang {currentPage} / {pagedResult.totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(pagedResult.totalPages, p + 1))}
                disabled={currentPage === pagedResult.totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <AlertDialog open={!!actionItem} onOpenChange={(open) => !open && setActionItem(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800 text-xl">
              {actionItem?.action === 'publish' ? 'Duyệt xuất bản bài viết' : 
               actionItem?.action === 'reject' ? 'Từ chối bài viết' : 'Xóa bài viết'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base mt-2">
              {actionItem?.action === 'publish' ? (
                <>Bạn có chắc chắn muốn duyệt và xuất bản bài viết <strong>{actionItem.article.title}</strong> ra công chúng không?</>
              ) : actionItem?.action === 'reject' ? (
                <>Bạn có chắc chắn muốn từ chối bài viết <strong>{actionItem.article.title}</strong>? Bác sĩ sẽ thấy bài viết bị từ chối.</>
              ) : (
                <>Bạn có chắc chắn muốn xóa vĩnh viễn bài viết <strong>{actionItem?.article.title}</strong>? Thao tác không thể hoàn tác.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publishMutation.isPending || rejectMutation.isPending || deleteMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleActionConfirm}
              className={
                actionItem?.action === 'publish' ? 'bg-emerald-600 hover:bg-emerald-700' :
                actionItem?.action === 'reject' ? 'bg-amber-600 hover:bg-amber-700' :
                'bg-red-600 hover:bg-red-700'
              }
              disabled={publishMutation.isPending || rejectMutation.isPending || deleteMutation.isPending}
            >
              {publishMutation.isPending || rejectMutation.isPending || deleteMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewArticleId} onOpenChange={(open) => !open && setPreviewArticleId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {isPreviewLoading ? <Skeleton className="h-8 w-2/3" /> : previewDetail?.title}
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-2 flex flex-wrap gap-4">
              {isPreviewLoading ? (
                <Skeleton className="h-4 w-1/3" />
              ) : (
                <>
                  <span>Tác giả: <strong className="text-slate-700">{previewDetail?.authorName}</strong></span>
                  <span>Chuyên khoa: <strong className="text-slate-700">{previewDetail?.specialtyName}</strong></span>
                  {previewDetail?.status && (
                    <span>Trạng thái: <strong className="text-slate-700">{previewDetail.status}</strong></span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 border-t pt-6">
            {isPreviewLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-40 w-full mt-4" />
              </div>
            ) : (
              <div 
                className="prose prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: previewDetail?.content || '' }} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
