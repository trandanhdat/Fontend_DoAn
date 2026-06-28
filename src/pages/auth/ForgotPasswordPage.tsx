import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseMedical, Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services/auth.service";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email của bạn!");
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await authService.forgotPassword(email);
      toast.success(res.message || "Vui lòng kiểm tra email của bạn để nhận hướng dẫn khôi phục.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi reset mật khẩu. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7FB] font-sans p-4">
      {/* Logo & Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-[#15718E] p-3 rounded-xl mb-4 shadow-sm">
          <BriefcaseMedical className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          <span className="text-[#104870]">Quên mật khẩu</span>
        </h1>
        <p className="text-slate-500 text-center max-w-sm">
          Nhập email đăng ký tài khoản, chúng tôi sẽ gửi cho bạn hướng dẫn khôi phục mật khẩu.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full max-w-[420px] p-8 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Địa chỉ Email
            </label>
            <div className="relative">
              <input
                type="email"
                autoComplete="off"
                placeholder="Ví dụ: nguyenvan@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#15718E] focus:border-[#15718E] transition-colors pl-10"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
              "Gửi yêu cầu"
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
