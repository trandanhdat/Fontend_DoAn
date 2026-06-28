import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseMedical, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";

// 1. Định nghĩa Schema Validation với Zod
const loginSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const response = await authService.login({
        username: data.username,
        password: data.password,
      });

      const user = await authService.getMe(response.accessToken);
      setAuth(user, response.accessToken);
      toast.success("Đăng nhập thành công!");

      const roles = user.roles || [];

      if (roles.includes("Admin")) {
        navigate("/admin/dashboard");
      } else if (roles.includes("Doctor")) {
        navigate("/doctor/dashboard");
      } else if (roles.includes("Patient")) {
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* Cột trái: Hình ảnh & Branding (chỉ hiện trên màn hình lớn) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src="/login_bg.png"
            alt="Clinic Background"
            className="w-full h-full object-cover opacity-50 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3A4D] via-[#15718E]/60 to-transparent opacity-90"></div>
        </div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="inline-flex items-center justify-center p-4 bg-white/20 backdrop-blur-md rounded-2xl mb-8 shadow-2xl border border-white/10">
            <BriefcaseMedical className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
            Chăm sóc sức khỏe<br />thông minh & toàn diện
          </h1>
          <p className="text-lg text-blue-50 leading-relaxed mb-8 opacity-90">
            Hệ thống quản lý phòng khám hiện đại, giúp bạn dễ dàng kết nối với đội ngũ y bác sĩ hàng đầu chỉ với vài thao tác.
          </p>
        </div>
      </div>

      {/* Cột phải: Form đăng nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl opacity-60 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#15718E]/10 rounded-full blur-3xl opacity-60 pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="bg-gradient-to-br from-[#15718E] to-[#0B3A4D] p-3 rounded-2xl mb-4 shadow-lg">
              <BriefcaseMedical className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Med<span className="text-[#15718E]">Clinical</span>
            </h1>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Chào mừng trở lại! 👋</h2>
              <p className="text-slate-500 text-sm">Vui lòng đăng nhập để tiếp tục truy cập vào hệ thống.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Tên đăng nhập
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    className={`w-full px-4 py-3.5 bg-slate-50 hover:bg-white text-slate-800 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-200 ${errors.username
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30"
                      : "border-slate-200 focus:border-[#15718E] focus:ring-[#15718E]/20"
                      }`}
                    {...register("username")}
                  />
                </div>
                {errors.username && (
                  <div className="flex items-center text-red-500 text-xs mt-1.5 font-medium animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    <span>{errors.username.message}</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Mật khẩu
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#15718E] hover:text-[#0B3A4D] hover:underline font-medium transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    className={`w-full px-4 py-3.5 bg-slate-50 hover:bg-white text-slate-800 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-200 pr-12 ${errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30"
                      : "border-slate-200 focus:border-[#15718E] focus:ring-[#15718E]/20"
                      }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#15718E] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center text-red-500 text-xs mt-1.5 font-medium animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    <span>{errors.password.message}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group bg-[#15718E] hover:bg-[#105d76] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-70 flex justify-center items-center shadow-lg shadow-[#15718E]/20 hover:shadow-xl hover:shadow-[#15718E]/30 hover:-translate-y-0.5 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Bạn mới đến MedClinical?{" "}
              <Link
                to="/register"
                className="text-[#15718E] font-bold hover:underline transition-all"
              >
                Tạo tài khoản ngay
              </Link>
            </p>
            <p className="mt-8 text-xs text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} MedClinical Systems. Toàn quyền bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

