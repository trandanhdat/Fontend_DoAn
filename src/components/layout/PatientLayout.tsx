import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Calendar,
  FolderOpen,
  MessageSquare,
  Settings,
  LogOut,
  Search,
  User
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { NotificationBell } from "./NotificationBell";

export const PatientLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const isNavActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 text-2xl font-bold">
            <span className="text-[#104870]">Med</span>
            <span className="text-[#2b88aa]">Clinical</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-600">
            <Link to="/" className="hover:text-[#1b8eb7] transition-colors pb-1">Trang chủ</Link>
            <Link to="/doctors" className="hover:text-[#1b8eb7] transition-colors pb-1">Bác sĩ</Link>
            <Link to="/specialties" className="hover:text-[#1b8eb7] transition-colors pb-1">Chuyên khoa</Link>
            <Link to="/articles" className="hover:text-[#1b8eb7] transition-colors pb-1">Tin tức</Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ..."
                className="w-64 h-10 pl-10 pr-4 rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-[#2b88aa] text-sm outline-none"
              />
            </div>
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
                    <Link to="/patient/settings" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#15718E]">
                      Thông tin tài khoản
                    </Link>
                    <Link to="/patient/records" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#15718E]">
                      Lịch hẹn của tôi
                    </Link>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-6">
          <div className="px-6 mb-8">
            <h2 className="text-[#104870] font-bold text-lg leading-tight">Patient Portal</h2>
            <p className="text-slate-500 text-xs font-medium">Health Management</p>
          </div>

          <div className="flex-1 flex flex-col gap-1 px-3">
            <SidebarItem icon={<LayoutDashboard />} label="Dashboard" to="/patient/dashboard" active={isNavActive('/dashboard')} />
            <SidebarItem icon={<Calendar />} label="Book Appointment" to="/patient/book-appointment/confirm" active={isNavActive('/book-appointment')} />
            <SidebarItem icon={<FolderOpen />} label="My Records" to="/patient/records" active={isNavActive('/records')} />
            <SidebarItem icon={<MessageSquare />} label="Messages" to="/patient/messages" active={isNavActive('/messages')} />
            <SidebarItem icon={<Settings />} label="Settings" to="/patient/settings" active={isNavActive('/settings')} />
          </div>

          <div className="px-3 pt-4 border-t border-gray-100 mt-auto">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, to, active = false }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
          ? 'bg-slate-100 text-[#15718E]'
          : 'text-slate-600 hover:bg-slate-50 hover:text-[#15718E]'
        }`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 shrink-0" })}
      {label}
    </Link>
  );
};
