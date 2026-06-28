import React, { useState } from 'react';
import { Search, Filter, BookOpen, AlertCircle } from 'lucide-react';
import { usePublishedArticles, useSpecialties } from '../../hooks/usePublicData';
import { ArticleCard } from '../../components/article/ArticleCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const ArticleListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [specialtyId, setSpecialtyId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: specialties } = useSpecialties();
  
  const { data: articlePage, isLoading, error } = usePublishedArticles({
    keyword: appliedSearch,
    specialtyId,
    page,
    pageSize: 9
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchTerm);
    setPage(1);
  };

  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSpecialtyId(val ? Number(val) : undefined);
    setPage(1);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Kiến thức Y khoa</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Cập nhật những thông tin y tế, sức khỏe mới nhất từ đội ngũ chuyên gia, bác sĩ uy tín của chúng tôi.
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-10">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm bài viết..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-[#2E86AB]"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Filter className="h-5 w-5 text-slate-400" />
                </div>
                <select 
                  value={specialtyId || ''}
                  onChange={handleSpecialtyChange}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-[#2E86AB] focus:border-[#2E86AB] block w-full pl-10 p-2.5 h-12"
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {specialties?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="h-12 px-6 bg-[#2E86AB] hover:bg-[#236b8a]">
                Tìm kiếm
              </Button>
            </div>
          </form>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-64">
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-2/3 mb-4" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5 mt-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-red-100 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Không thể tải bài viết</h3>
            <p className="text-slate-600">Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.</p>
          </div>
        ) : articlePage?.items && articlePage.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {articlePage.items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {articlePage.totalPages > 0 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!articlePage.hasPreviousPage}
                >
                  Trang trước
                </Button>
                <div className="flex items-center px-4 font-medium text-slate-700 bg-white border border-slate-200 rounded-md">
                  {page} / {articlePage.totalPages}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.min(articlePage.totalPages, p + 1))}
                  disabled={!articlePage.hasNextPage}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-[#2E86AB]" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có bài viết nào</h3>
            <p className="text-slate-600 max-w-md">
              Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử thay đổi từ khóa hoặc bộ lọc.
            </p>
            {(appliedSearch || specialtyId) && (
              <Button 
                variant="outline" 
                className="mt-6 text-[#2E86AB] border-[#2E86AB] hover:bg-blue-50"
                onClick={() => {
                  setSearchTerm('');
                  setAppliedSearch('');
                  setSpecialtyId(undefined);
                  setPage(1);
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
