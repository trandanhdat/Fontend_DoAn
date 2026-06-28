import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { userService } from "../../services/user.service";
import { useAuthStore } from "../../store/auth.store";
import type { ChangePasswordDto } from "../../models/api.model";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmNewPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmNewPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const PasswordChangeForm: React.FC = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordDto) => userService.changePassword(data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      form.reset();
      clearAuth();
      navigate("/login");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra.";
      toast.error(msg);
    }
  });

  const onSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(values as ChangePasswordDto);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Mật khẩu hiện tại *</label>
        <input
          type="password"
          {...form.register("currentPassword")}
          className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] outline-none transition-colors"
        />
        {form.formState.errors.currentPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Mật khẩu mới *</label>
        <input
          type="password"
          {...form.register("newPassword")}
          className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] outline-none transition-colors"
        />
        {form.formState.errors.newPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu mới *</label>
        <input
          type="password"
          {...form.register("confirmNewPassword")}
          className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] outline-none transition-colors"
        />
        {form.formState.errors.confirmNewPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.confirmNewPassword.message}</p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="px-6 py-2.5 font-medium text-white bg-[#15718E] hover:bg-[#105d76] rounded-lg transition-colors flex items-center disabled:opacity-70"
        >
          {changePasswordMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Đổi mật khẩu"
          )}
        </button>
      </div>
    </form>
  );
};
