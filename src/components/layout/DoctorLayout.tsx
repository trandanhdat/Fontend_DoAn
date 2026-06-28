import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  CalendarDays,
  CheckCircle2,
  FilePlus,
  Stethoscope,
  User,
  FileText
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { NotificationBell } from "./NotificationBell";

export const DoctorLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  return (
    <div className="h-screen w-screen flex bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">

      {/* Left Sidebar (Full Height) */}
      <aside className="w-20 bg-white border-r border-slate-200 flex flex-col shrink-0 z-40 shadow-sm">
        <div className="h-16 flex items-center justify-center border-b border-slate-100">
          {/* Mini Logo */}
          <Link to="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#104870] to-[#2b88aa] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
            <Stethoscope className="w-6 h-6" />
          </Link>
        </div>
        <div className="flex flex-col gap-4 py-6 px-3 flex-1 overflow-y-auto">
          <SidebarItem to="/doctor/dashboard" icon={<LayoutDashboard />} label="Tổng quan" />
          <SidebarItem to="/doctor/patient-records" icon={<FilePlus />} label="Hồ sơ BN" />
          <SidebarItem to="/doctor/schedule" icon={<CalendarDays />} label="Lịch làm việc" />
          <SidebarItem to="/doctor/appointments" icon={<CheckCircle2 />} label="Lịch hẹn" />
          <SidebarItem to="/doctor/articles" icon={<FileText />} label="Bài viết" />
        </div>
      </aside>

      {/* Right Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">Phòng khám MedClinical</h2>
          </div>
          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="relative group">
              <button className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 overflow-hidden border border-slate-300 cursor-pointer shadow-sm hover:ring-2 hover:ring-[#2b88aa] transition-all focus:outline-none">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{user?.fullName || 'Bác sĩ'}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'admin@medclinical.vn'}</p>
                </div>
                <div className="py-2">
                  <Link to="/doctor/profile" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#15718E]">
                    Hồ sơ Bác sĩ
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
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative">
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
      end={to === '/doctor/dashboard'}
      className={({ isActive }) => `flex flex-col items-center gap-1.5 cursor-pointer group w-full ${isActive ? 'text-[#15718E]' : 'text-slate-500 hover:text-[#15718E]'}`}
    >
      {({ isActive }) => (
        <>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-[#15718E] text-white shadow-md shadow-blue-900/20' : 'bg-transparent hover:bg-slate-100 group-hover:scale-105 text-slate-500 group-hover:text-[#15718E]'}`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
          </div>
          <span className="text-[10px] font-semibold text-center leading-tight px-1 whitespace-nowrap">{label}</span>
        </>
      )}
    </NavLink>
  );
};
