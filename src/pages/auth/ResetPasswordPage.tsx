import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BriefcaseMedical, Lock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services/auth.service";

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      toast.error("Đường dẫn không hợp lệ hoặc đã hết hạn.");
      navigate("/login");
    }
  }, [email, token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ mật khẩu mới!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải dài ít nhất 6 ký tự!");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.resetPassword({
        email,
        token,
        newPassword
      });
      toast.success(res.message || "Đổi mật khẩu thành công!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi đổi mật khẩu. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !token) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7FB] font-sans p-4">
      {/* Logo & Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-[#15718E] p-3 rounded-xl mb-4 shadow-sm">
          <BriefcaseMedical className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          <span className="text-[#104870]">Tạo mật khẩu mới</span>
        </h1>
        <p className="text-slate-500 text-center max-w-sm">
          Tài khoản: {email}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full max-w-[420px] p-8 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#15718E] focus:border-[#15718E] transition-colors pl-10"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#15718E] focus:border-[#15718E] transition-colors pl-10"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#15718E] hover:bg-[#00556c] text-white font-medium py-3 rounded-md transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Lưu mật khẩu mới"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-slate-500 hover:text-[#15718E] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
