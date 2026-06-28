import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { userService } from "../../services/user.service";
import { ProfileForm } from "../../components/profile/ProfileForm";
import { PasswordChangeForm } from "../../components/profile/PasswordChangeForm";

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patientMe"],
    queryFn: userService.getMe,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#15718E] animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return <div className="p-8 text-center text-red-500">Không thể tải thông tin hồ sơ.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Hồ sơ của tôi</h1>
        <p className="text-slate-600">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
      </div>

      {/* Tabs Custom Implementation (Shadcn-like) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex px-4 pt-4 bg-slate-50 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "profile" 
                ? "border-[#15718E] text-[#15718E]" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "password" 
                ? "border-[#15718E] text-[#15718E]" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Đổi mật khẩu
          </button>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Thông tin cơ bản</h2>
              <ProfileForm initialData={patient} />
            </div>
          )}

          {activeTab === "password" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Cập nhật mật khẩu</h2>
              <PasswordChangeForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
