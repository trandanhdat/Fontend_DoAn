import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, User } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { NotificationBell } from "./NotificationBell";

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 text-2xl font-bold">
            <span className="text-[#104870]">Med</span>
            <span className="text-[#2b88aa]">Clinical</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-600">
            <Link 
              to="/" 
              className={`pb-1 transition-colors border-b-2 ${location.pathname === '/' ? 'text-[#1b8eb7] border-[#1b8eb7]' : 'border-transparent hover:text-[#1b8eb7]'}`}
            >
              Trang chủ
            </Link>
            <Link 
              to="/doctors" 
              className={`pb-1 transition-colors border-b-2 ${location.pathname.startsWith('/doctors') ? 'text-[#1b8eb7] border-[#1b8eb7]' : 'border-transparent hover:text-[#1b8eb7]'}`}
            >
              Bác sĩ
            </Link>

            <Link 
              to="/articles" 
              className={`pb-1 transition-colors border-b-2 ${location.pathname.startsWith('/articles') ? 'text-[#1b8eb7] border-[#1b8eb7]' : 'border-transparent hover:text-[#1b8eb7]'}`}
            >
              Tin tức
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">

            <NotificationBell />
            {isAuthenticated ? (
              <div className="relative group">
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 overflow-hidden border border-gray-200 focus:outline-none">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    {user?.roles?.includes("Admin") && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#15718E]">
                        Trang Quản trị (Admin)
                      </Link>
                    )}
                    {user?.roles?.includes("Doctor") && (
                      <Link to="/doctor/dashboard" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#15718E]">
                        Trang quản lý Bác sĩ
                      </Link>
                    )}
                    {(!user?.roles || user?.roles?.includes("Patient")) && (
                      <>
                        <Link to="/patient/settings" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#15718E]">
                          Thông tin tài khoản
                        </Link>
                        <Link to="/patient/medical-history" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#15718E]">
                          Hồ sơ bệnh án
                        </Link>
                        <Link to="/patient/records" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#15718E]">
                          Lịch hẹn của tôi
                        </Link>
                      </>
                    )}
                    <button 
                      onClick={() => {
                        clearAuth();
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                to="/login"
                className="px-4 py-2 rounded-lg font-medium text-[#1b8eb7] border border-[#1b8eb7] hover:bg-blue-50 transition-colors"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-12 pb-6 mt-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-1 text-2xl font-bold mb-4">
                <span className="text-[#104870]">Med</span>
                <span className="text-[#2b88aa]">Clinical</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">
                Hệ thống đặt lịch khám bệnh hàng đầu, kết nối hàng nghìn bệnh nhân với các bác sĩ chuyên khoa mỗi ngày.
              </p>
              <div className="flex gap-4 mt-6">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2b88aa] cursor-pointer hover:bg-[#104870] hover:text-white transition-colors">FB</div>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2b88aa] cursor-pointer hover:bg-[#104870] hover:text-white transition-colors">IG</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-4 text-base">Khám phá</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/" className="hover:text-[#2b88aa]">Trang chủ</Link></li>
                <li><Link to="/doctors" className="hover:text-[#2b88aa]">Đội ngũ bác sĩ</Link></li>
                <li><Link to="/articles" className="hover:text-[#2b88aa]">Tin tức & Cẩm nang</Link></li>
              </ul>
            </div>
            
            <div className="text-sm text-gray-500 space-y-3">
              <p className="font-semibold text-gray-800 mb-4 text-base">Thông tin liên hệ</p>
              <p className="flex items-center gap-2"><span>📍</span> 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</p>
              <p className="flex items-center gap-2"><span>📞</span> Hotline: 1900 1234</p>
              <p className="flex items-center gap-2"><span>📧</span> Email: hello@medclinical.vn</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>© 2024 MedClinical Systems. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span>Hỗ trợ: 1900 1234</span>
              <span>Email: hello@medclinical.vn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
