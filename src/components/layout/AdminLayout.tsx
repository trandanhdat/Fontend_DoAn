import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Users,
  Stethoscope,
  Tags,
  ActivitySquare,
  FileText,
  UserCircle,
  Calendar
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { NotificationBell } from "./NotificationBell";

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  return (
    <div className="h-screen w-screen flex bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-40 shadow-xl transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-md group-hover:shadow-emerald-500/20 transition-all">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">MedClinical <span className="text-emerald-400 font-medium">Admin</span></span>
          </Link>
        </div>
        <div className="flex flex-col gap-1 py-6 px-4 flex-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quản lý hệ thống</p>
          <SidebarItem to="/admin/dashboard" icon={<LayoutDashboard />} label="Tổng quan" />
          <SidebarItem to="/admin/users" icon={<Users />} label="Người dùng" />
          <SidebarItem to="/admin/doctors" icon={<Stethoscope />} label="Bác sĩ" />
          
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">Lịch khám & Lễ tân</p>
          <SidebarItem to="/admin/reception" icon={<ActivitySquare />} label="Tiếp đón bệnh nhân" />
          
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">Danh mục</p>
          <SidebarItem to="/admin/specialties" icon={<Tags />} label="Chuyên khoa" />
          <SidebarItem to="/admin/services" icon={<ActivitySquare />} label="Dịch vụ khám" />
          
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">Nội dung</p>
          <SidebarItem to="/admin/articles" icon={<FileText />} label="Bài viết y khoa" />
        </div>
      </aside>

      {/* Right Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight hidden sm:block">Admin Portal</h2>
          </div>
          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="relative group">
              <button className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 flex flex-shrink-0 items-center justify-center">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-slate-700 leading-none">{user?.fullName || 'Administrator'}</p>
                  <p className="text-xs text-slate-500 mt-1">Quản trị viên</p>
                </div>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden transform origin-top-right scale-95 group-hover:scale-100">
                <div className="py-1">
                  <button
                    onClick={() => {
                      clearAuth();
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
      }`}
    >
      {({ isActive }) => (
        <>
          {React.cloneElement(icon as React.ReactElement, { 
            className: `w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}` 
          })}
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
};
