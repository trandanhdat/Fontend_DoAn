import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Briefcase, CreditCard, Star, User, Loader2, ChevronDown } from "lucide-react";

import { doctorService } from "../../services/doctor.service";
import { specialtyService } from "../../services/specialty.service";
import { QuickBookModal } from "../../components/appointment/QuickBookModal";

export const DoctorListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(searchParams.get("specialtyId") || "all");
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const specId = searchParams.get("specialtyId");
    if (specId) {
      setSelectedSpecialty(specId);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Fetch Specialties
  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: specialtyService.getAllActive,
  });

  // Fetch Doctors
  const { data: allDoctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.getAll,
  });

  // Derived state for filtering
  const filteredDoctors = allDoctors.filter(doc => {
    const matchSearch = (doc.fullName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpecialty = selectedSpecialty === "all" || (doc.specialtyId?.toString() || "") === selectedSpecialty;
    return matchSearch && matchSpecialty;
  });

  const totalPages = Math.ceil(filteredDoctors.length / pageSize);
  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Tìm kiếm bác sĩ</h1>
          <p className="text-slate-600">Kết nối với các chuyên gia y tế hàng đầu cho nhu cầu sức khỏe của bạn.</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm tên bác sĩ hoặc triệu chứng..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-[#15718E] focus:border-[#15718E] text-slate-800 placeholder-slate-400 outline-none transition-colors"
            />
          </div>

          {/* Specialty Select */}
          <div className="w-full md:w-64 relative">
            <select
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-[#15718E] focus:border-[#15718E] text-slate-800 outline-none transition-colors appearance-none bg-white cursor-pointer"
            >
              <option value="all">Tất cả chuyên khoa</option>
              {specialties.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loadingDoctors ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#15718E] animate-spin mb-4" />
            <p className="text-slate-500">Đang tải danh sách bác sĩ...</p>
          </div>
        ) : paginatedDoctors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {paginatedDoctors.map((doc, index) => (
                <div key={doc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="p-6 flex-1">

                    {/* Top: Avatar & Badge */}
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0 relative">
                        {doc.avatarUrl ? (
                          <img src={doc.avatarUrl} alt={doc.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-start">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${index % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {index % 2 === 0 ? 'Available' : 'Top Rated'}
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <Star className="w-3 h-3 fill-amber-400" />
                            <Star className="w-3 h-3 fill-amber-400" />
                            <Star className="w-3 h-3 fill-amber-400" />
                            <Star className="w-3 h-3 fill-amber-400" />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">
                          {doc.degree}, BS. {doc.fullName}
                        </h3>
                        <p className="text-sm font-medium text-[#15718E]">
                          {doc.specialtyName}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="flex flex-col gap-3 text-sm text-slate-600 mb-6">
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <div className="flex justify-between flex-1">
                          <span>Kinh nghiệm</span>
                          <span className="font-medium text-slate-800">{doc.experienceYears}+ năm</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <div className="flex justify-between flex-1">
                          <span>Phí khám</span>
                          <span className="font-medium text-slate-800">{doc.consultationFee.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <div className="flex justify-between flex-1">
                          <span>Phòng khám</span>
                          <span className="font-medium text-slate-800 text-right">Quận 1, TP.HCM</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Bottom: Action Buttons */}
                  <div className="p-4 border-t border-slate-100 flex gap-3 mt-auto bg-slate-50/50">
                    <button
                      onClick={() => navigate(`/doctors/${doc.id}`)}
                      className="flex-1 py-2 rounded border border-[#15718E] text-[#15718E] font-medium text-sm hover:bg-blue-50 transition-colors"
                    >
                      Xem hồ sơ
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        setIsBookModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded bg-[#15718E] hover:bg-[#105d76] text-white font-medium text-sm transition-colors shadow-sm"
                    >
                      Đặt lịch
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trang trước
                </button>
                <div className="flex items-center gap-1 font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-1">Không tìm thấy bác sĩ nào</h3>
            <p className="text-slate-500">Vui lòng thử lại với từ khóa hoặc chuyên khoa khác.</p>
          </div>
        )}

      </div>

      {/* Quick Book Modal */}
      {selectedDoctorId && (
        <QuickBookModal
          isOpen={isBookModalOpen}
          doctorId={selectedDoctorId}
          onClose={() => setIsBookModalOpen(false)}
          onSuccess={() => {
            // Success logic
          }}
        />
      )}
    </div>
  );
};
