import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, User, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import { useArticleDetail } from '../../hooks/usePublicData';
import { getImageUrl } from '@/utils/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useArticleDetail(slug || '');

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-4 w-24 mb-8" />
          <Skeleton className="h-6 w-32 mb-4 rounded-full" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-3/4 mb-6" />
          
          <div className="flex gap-4 mb-10 border-b border-slate-100 pb-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full mt-8" />
            <Skeleton className="h-4 w-10/12" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-slate-50 min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy bài viết</h1>
            <p className="text-slate-600 mb-8">
              Bài viết bạn đang tìm kiếm có thể đã bị xóa, thay đổi đường dẫn hoặc chưa được xuất bản.
            </p>
            <Button asChild className="bg-[#2E86AB] hover:bg-[#236b8a]">
              <Link to="/articles">
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách bài viết
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/articles" className="inline-flex items-center text-sm text-[#2E86AB] font-medium hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-1" /> Danh sách bài viết
        </Link>
        
        <article className="mb-16">
          <header className="mb-8">
            <Badge className="bg-[#2E86AB]/10 text-[#2E86AB] hover:bg-[#2E86AB]/20 border-0 mb-4 px-3 py-1 text-sm">
              {article.specialtyName}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-500 border-y border-slate-100 py-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700">Tác giả: {article.authorName}</span>
              </div>
              
              {article.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(article.publishedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>{article.viewCount} lượt xem</span>
              </div>
            </div>
          </header>
          
          {article.thumbnailUrl && (
            <figure className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <img 
                src={getImageUrl(article.thumbnailUrl)} 
                alt={article.title} 
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </figure>
          )}

          {article.summary && (
            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 mb-8 text-slate-700 font-medium leading-relaxed italic">
              {article.summary}
            </div>
          )}
          
          {/* Main content - Rendered as HTML since it's from Rich Text Editor */}
          <div 
            className="prose prose-slate prose-lg max-w-none 
              prose-headings:text-slate-800 prose-headings:font-bold
              prose-a:text-[#2E86AB] hover:prose-a:text-[#236b8a]
              prose-img:rounded-xl prose-img:shadow-sm"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
        
        <div className="border-t border-slate-200 pt-8 flex justify-center">
          <Button asChild variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-50">
            <Link to="/articles">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh mục bài viết
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
