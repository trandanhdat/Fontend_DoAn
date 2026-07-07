import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HeartPulse, Baby, Activity, Smile, Eye, Brain, Bone, Stethoscope,
  Star, MessageSquare, ChevronLeft, ChevronRight, Image as ImageIcon
} from "lucide-react";

import { specialtyService } from "../../services/specialty.service";
import { doctorService } from "../../services/doctor.service";
import { articleService } from "../../services/article.service";
import { getImageUrl } from "../../utils/image";

export const HomePage: React.FC = () => {

  const { data: specialties = [], isLoading: loadingSpecialties } = useQuery({
    queryKey: ['specialties', 'active'],
    queryFn: specialtyService.getAllActive,
  });

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.getAll,
  });

  const { data: articleResult, isLoading: loadingArticles } = useQuery({
    queryKey: ['articles', 'published', { page: 1, pageSize: 3 }],
    queryFn: () => articleService.getPublished({ page: 1, pageSize: 3 }),
  });

  const articles = articleResult?.items || [];

  // Lấy top 8 chuyên khoa
  const displaySpecialties = specialties.slice(0, 8);

  // Bác sĩ tiêu biểu (Carousel state)
  const [docIndex, setDocIndex] = useState(0);

  const topDoctors = [...doctors]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));

  const maxDocIndex = Math.max(0, topDoctors.length - 4);
  const displayDoctors = topDoctors.slice(docIndex, docIndex + 4);

  const handlePrevDoctor = () => setDocIndex(prev => Math.max(0, prev - 1));
  const handleNextDoctor = () => setDocIndex(prev => Math.min(maxDocIndex, prev + 1));

  // Ánh xạ icon tạm thời cho chuyên khoa nếu backend chỉ trả string iconUrl hoặc null
  const getIconForSpecialty = (name: string) => {
    const map: Record<string, any> = {
      "Tim mạch": HeartPulse,
      "Nhi khoa": Baby,
      "Da liễu": Activity,
      "Nha khoa": Smile,
      "Nhãn khoa": Eye,
      "Thần kinh": Brain,
      "Xương khớp": Bone,
      "Nội khoa": Stethoscope,
    };
    const Icon = map[name] || HeartPulse;
    return <Icon className="w-6 h-6 text-[#15718E] group-hover:text-white" />;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] bg-slate-50 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-r from-blue-50 to-blue-50/20 flex items-center justify-end px-10 md:px-20 overflow-hidden">
            <div className="w-[600px] h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform translate-x-10 translate-y-4 hidden md:block">
              <img src="/clinic_hero.png?v=2" alt="Clinic Reception" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight mb-4">
              Đặt lịch khám bệnh trực tuyến nhanh chóng & dễ dàng
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Hệ thống kết nối bạn với các bác sĩ hàng đầu tại Việt Nam. Chăm sóc sức khỏe toàn diện ngay tại nhà.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/book-doctor" className="px-6 py-3 bg-[#15718E] hover:bg-[#105d76] text-white font-medium rounded-md transition-colors inline-block text-center shadow-sm">
                Đặt lịch theo Bác sĩ
              </Link>
              <Link to="/book-general" className="px-6 py-3 bg-white hover:bg-slate-50 text-[#15718E] font-medium rounded-md border border-[#15718E] transition-colors inline-block text-center shadow-sm">
                Đặt khám Tổng quát
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Chuyên khoa phổ biến */}
      <section className="py-16 container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Chuyên khoa phổ biến</h2>
            <p className="text-slate-500">Lựa chọn chuyên khoa phù hợp với nhu cầu của bạn</p>
          </div>
          <Link to="/specialties" className="text-[#15718E] hover:underline font-medium text-sm">
            Xem tất cả
          </Link>
        </div>

        {loadingSpecialties ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {displaySpecialties.map((spec) => (
              <Link to={`/doctors?specialtyId=${spec.id}`} key={spec.id} className="flex flex-col items-center justify-center p-6 border border-slate-100 rounded-xl hover:shadow-md transition-all bg-white group">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-[#15718E] transition-colors overflow-hidden">
                  {spec.iconUrl ? (
                    <img src={getImageUrl(spec.iconUrl)} alt={spec.name} className="w-8 h-8 object-contain" />
                  ) : (
                    getIconForSpecialty(spec.name)
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 text-center">{spec.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Bác sĩ tiêu biểu */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Bác sĩ tiêu biểu</h2>
              <p className="text-slate-500">Đội ngũ chuyên gia giàu kinh nghiệm luôn sẵn sàng</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevDoctor}
                disabled={docIndex === 0}
                className={`w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center transition-colors ${docIndex === 0 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNextDoctor}
                disabled={docIndex >= maxDocIndex}
                className={`w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center transition-colors ${docIndex >= maxDocIndex ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loadingDoctors ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-xl border border-slate-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayDoctors.map((doc, idx) => (
                <div key={doc.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                  <div className="h-56 bg-slate-200 overflow-hidden relative shrink-0">
                    {doc.avatarUrl ? (
                      <img src={getImageUrl(doc.avatarUrl)} alt={doc.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center`}>
                        <UserPlaceholder color={idx % 2 === 0 ? "text-slate-500" : "text-white"} />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-slate-800 mb-1">{doc.fullName}</h3>
                    <p className="text-sm text-[#15718E] font-medium mb-3">{doc.specialtyName}</p>
                    <div className="flex items-center gap-1 mb-5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-slate-700">{doc.averageRating ?? 5.0}</span>
                      <span className="text-sm text-slate-500">({doc.totalReviews ?? 0} đánh giá)</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <span className="text-slate-500 text-sm">{doc.consultationFee.toLocaleString('vi-VN')}đ</span>
                      <Link to={`/doctors/${doc.id}`} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#15718E] font-medium rounded-md text-sm transition-colors">
                        Xem hồ sơ
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cẩm nang sức khỏe */}
      <section className="py-16 container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Cẩm nang sức khỏe</h2>
            <p className="text-slate-500">Kiến thức y khoa hữu ích giúp bạn chăm sóc bản thân</p>
          </div>
          <Link to="/articles" className="text-[#15718E] hover:underline font-medium text-sm">
            Đọc thêm bài viết
          </Link>
        </div>

        {loadingArticles ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-xl border border-slate-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link to={`/articles/${article.slug}`} key={article.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                <div className="h-48 bg-indigo-50 flex items-center justify-center shrink-0 overflow-hidden">
                  {article.thumbnailUrl ? (
                    <img src={getImageUrl(article.thumbnailUrl)} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-indigo-200 group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">{article.specialtyName}</span>
                    <span className="text-xs text-slate-400">{new Date(article.publishedAt || '').toLocaleDateString('vi-VN')}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-[#15718E] transition-colors">{article.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{article.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>


    </div>
  );
};

const UserPlaceholder = ({ color }: { color: string }) => (
  <svg className={`w-24 h-24 ${color} opacity-50`} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);
