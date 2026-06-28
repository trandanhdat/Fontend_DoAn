import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ArticleSummaryDto } from '@/models/api.model';
import { getImageUrl } from '@/utils/image';

interface ArticleCardProps {
  article: ArticleSummaryDto;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  // Tạo gradient pseudo-random dựa trên ID bài viết (dùng làm fallback)
  const gradients = [
    'from-blue-500 to-cyan-400',
    'from-emerald-400 to-cyan-500',
    'from-indigo-500 to-purple-500',
    'from-rose-400 to-orange-400',
    'from-amber-400 to-orange-500',
    'from-fuchsia-500 to-pink-500',
    'from-blue-600 to-indigo-600',
    'from-teal-400 to-emerald-500'
  ];
  const gradient = gradients[article.id % gradients.length];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group hover:-translate-y-1">
      {/* Thumbnail / Header Area */}
      <Link to={`/articles/${article.slug}`} className="block">
        <div className={`h-48 w-full p-5 flex flex-col justify-between relative overflow-hidden ${!article.thumbnailUrl ? `bg-gradient-to-br ${gradient}` : 'bg-slate-100'}`}>
          
          {/* Thumbnail Image */}
          {article.thumbnailUrl && (
            <>
              <img 
                src={getImageUrl(article.thumbnailUrl)} 
                alt={article.title} 
                className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay to make text readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 z-0 mix-blend-multiply"></div>
            </>
          )}

          {/* Overlay pattern (chỉ dùng cho gradient fallback) */}
          {!article.thumbnailUrl && (
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay opacity-50 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          )}
          
          <div className="relative z-10 flex justify-between items-start">
            <Badge className="bg-white/95 text-slate-800 hover:bg-white border-0 shadow-sm font-semibold px-3 py-1">
              {article.specialtyName}
            </Badge>
            <div className="flex items-center text-white text-sm gap-1.5 bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{article.viewCount}</span>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-6 flex-1 flex flex-col">
        <Link to={`/articles/${article.slug}`} className="flex-1 group-hover:text-[#2E86AB] transition-colors">
          <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 leading-snug">
            {article.title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
            {article.summary || "Không có tóm tắt cho bài viết này."}
          </p>
        </Link>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
              <User className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="font-semibold text-slate-700 truncate max-w-[120px]">{article.authorName}</span>
          </div>
          {article.publishedAt && (
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(article.publishedAt), 'dd/MM/yyyy')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
