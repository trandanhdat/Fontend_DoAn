import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseMedical, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services/auth.service";

// 1. Định nghĩa Schema Validation với Zod (Xác nhận mật khẩu)
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Vui lòng nhập họ và tên"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().min(10, "Số điện thoại không hợp lệ").max(11),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const currentPassword = watch("password");

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      await authService.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      toast.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        "Đăng ký thất bại. Email có thể đã tồn tại!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* Cột trái: Hình ảnh & Branding */}
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
            Khởi đầu hành trình<br />chăm sóc sức khỏe
          </h1>
          <p className="text-lg text-blue-50 leading-relaxed mb-8 opacity-90">
            Tạo tài khoản MedClinical ngay hôm nay để trải nghiệm dịch vụ đặt lịch khám bệnh trực tuyến tiện lợi, quản lý hồ sơ sức khỏe trọn đời.
          </p>
        </div>
      </div>

      {/* Cột phải: Form đăng ký */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 relative overflow-y-auto">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl opacity-60 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#15718E]/10 rounded-full blur-3xl opacity-60 pointer-events-none transform translate-x-1/2 translate-y-1/2"></div>

        <div className="w-full max-w-md relative z-10 py-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-[#15718E] to-[#0B3A4D] p-3 rounded-2xl mb-4 shadow-lg">
              <BriefcaseMedical className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Med<span className="text-[#15718E]">Clinical</span>
            </h1>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Tạo tài khoản mới</h2>
              <p className="text-slate-500 text-sm">Điền thông tin bên dưới để bắt đầu đăng ký</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Họ và Tên */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Họ và Tên</label>
                <div className="relative group">
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="Nhập họ và tên"
                    className={`w-full px-4 py-3 bg-slate-50 hover:bg-white text-slate-800 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-200 ${errors.fullName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30"
                      : "border-slate-200 focus:border-[#15718E] focus:ring-[#15718E]/20"
                      }`}
                    {...register("fullName")}
                  />
                </div>
                {errors.fullName && (
                  <div className="flex items-center text-red-500 text-xs mt-1.5 font-medium animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    <span>{errors.fullName.message}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative group">
                  <input
                    type="email"
                    autoComplete="off"
                    placeholder="Nhập Email"
                    className={`w-full px-4 py-3 bg-slate-50 hover:bg-white text-slate-800 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-200 ${errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30"
                      : "border-slate-200 focus:border-[#15718E] focus:ring-[#15718E]/20"
                      }`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center text-red-500 text-xs mt-1.5 font-medium animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-sm font-semibold text-slate-700">Số điện thoại</label>
                <div className="relative group">
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="Nhập số điện thoại"
                    className={`w-full px-4 py-3 bg-slate-50 hover:bg-white text-slate-800 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-200 ${errors.phone
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30"
                      : "border-slate-200 focus:border-[#15718E] focus:ring-[#15718E]/20"
                      }`}
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <div className="flex items-center text-red-500 text-xs mt-1.5 font-medium animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    <span>{errors.phone.message}</span>
                  </div>
                )}
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-sm font-semibold text-slate-700">Mật khẩu</label>
                <div className="relative group">
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Nhập mật khẩu"
                    className={`w-full px-4 py-3 bg-slate-50 hover:bg-white text-slate-800 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-200 pr-12 ${errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30"
                      : touchedFields.password && currentPassword?.length >= 6
                        ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        : "border-slate-200 focus:border-[#15718E] focus:ring-[#15718E]/20"
                      }`}
                    {...register("password")}
                  />
                  {touchedFields.password && !errors.password && currentPassword?.length >= 6 && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute right-4 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {errors.password && (
                  <div className="flex items-center text-red-500 text-xs mt-1.5 font-medium animate-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    <span>{errors.password.message}</span>
                  </div>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-sm font-semibold text-slate-700">Xác nhận mật khẩu</label>
                <div className="relative group">
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full px-4 py-3 bg-slate-50 hover:bg-white text-slate-800 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-200 pr-12 ${errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30"
                      : "border-slate-200 focus:border-[#15718E] focus:ring-[#15718E]/20"
                      }`}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <AlertCircle className="w-5 h-5 text-red-500 absolute right-4 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group bg-[#15718E] hover:bg-[#105d76] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-70 flex justify-center items-center shadow-lg shadow-[#15718E]/20 hover:shadow-xl hover:shadow-[#15718E]/30 hover:-translate-y-0.5 mt-6"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Đăng ký tài khoản</span>
                    <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-[#15718E] font-bold hover:underline transition-all"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
