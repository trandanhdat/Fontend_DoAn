import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Activity, Heart, Eye, Brain, Bone, Baby, Syringe } from 'lucide-react';
import { useSpecialties } from '../../hooks/usePublicData';
import { Skeleton } from '@/components/ui/skeleton';

export const SpecialtyListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: specialties, isLoading, error } = useSpecialties();

  // Helper function to map specialty names to generic icons if iconUrl is not provided
  const getIconForSpecialty = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('tim') || lowerName.includes('mạch')) return <Heart className="w-8 h-8 text-[#2E86AB]" />;
    if (lowerName.includes('mắt') || lowerName.includes('nhãn')) return <Eye className="w-8 h-8 text-[#2E86AB]" />;
    if (lowerName.includes('thần kinh') || lowerName.includes('tâm thần')) return <Brain className="w-8 h-8 text-[#2E86AB]" />;
    if (lowerName.includes('xương') || lowerName.includes('khớp')) return <Bone className="w-8 h-8 text-[#2E86AB]" />;
    if (lowerName.includes('nhi')) return <Baby className="w-8 h-8 text-[#2E86AB]" />;
    if (lowerName.includes('tiêm') || lowerName.includes('vắc')) return <Syringe className="w-8 h-8 text-[#2E86AB]" />;
    return <Stethoscope className="w-8 h-8 text-[#2E86AB]" />;
  };

  const handleSpecialtyClick = (specialtyId: number) => {
    // Navigate to doctor list and pass specialtyId as state or query param
    navigate(`/doctors?specialtyId=${specialtyId}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Danh mục Chuyên khoa</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Hệ thống cung cấp dịch vụ khám chữa bệnh đa dạng với các chuyên khoa sâu, được phụ trách bởi đội ngũ y bác sĩ giàu kinh nghiệm.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
            <Activity className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi</h3>
            <p className="text-slate-600">Không thể tải danh sách chuyên khoa lúc này. Vui lòng thử lại sau.</p>
          </div>
        ) : specialties && specialties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {specialties.map((specialty) => (
              <div 
                key={specialty.id}
                onClick={() => handleSpecialtyClick(specialty.id)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-[#2E86AB]/30 transition-all cursor-pointer group flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {specialty.iconUrl ? (
                    <img src={specialty.iconUrl} alt={specialty.name} className="w-8 h-8 object-contain" />
                  ) : (
                    getIconForSpecialty(specialty.name)
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#2E86AB] transition-colors">
                  {specialty.name}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2">
                  {specialty.description || "Chưa có mô tả chi tiết cho chuyên khoa này."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Stethoscope className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có chuyên khoa nào</h3>
            <p className="text-slate-600">Hệ thống đang cập nhật danh mục chuyên khoa. Bạn vui lòng quay lại sau nhé.</p>
          </div>
        )}
      </div>
    </div>
  );
};
