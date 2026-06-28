import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Save, Stethoscope, GraduationCap, DollarSign, ClipboardList, User } from "lucide-react";

import { doctorService } from "../../services/doctor.service";
import { userService } from "../../services/user.service";
import { useAuthStore } from "../../store/auth.store";
import { getImageUrl } from "@/utils/image";

// ─── Schema ───────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ (10 số)")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(1000, "Tiểu sử không được vượt quá 1000 ký tự").optional().or(z.literal("")),
  degree: z.string().min(2, "Vui lòng nhập bằng cấp"),
  experienceYears: z
    .number({ invalid_type_error: "Vui lòng nhập số năm kinh nghiệm" })
    .int()
    .min(0, "Số năm kinh nghiệm không hợp lệ")
    .max(60),
  consultationFee: z
    .number({ invalid_type_error: "Vui lòng nhập phí tư vấn" })
    .min(0, "Phí tư vấn không hợp lệ"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export const DoctorProfileForm: React.FC = () => {
  const { user, setAuth, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const doctorId = user?.doctorId;

  // ── Load doctor profile data ────────────────────────────────────────────────
  const { data: doctorData, isLoading: loadingDoctor } = useQuery({
    queryKey: ["doctor-profile", doctorId],
    queryFn: () => doctorService.getById(doctorId!),
    enabled: !!doctorId,
  });

  React.useEffect(() => {
    if (!selectedFile) {
      setAvatarPreview(doctorData?.avatarUrl || user?.avatarUrl || null);
    }
  }, [doctorData?.avatarUrl, user?.avatarUrl, selectedFile]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      bio: "",
      degree: "",
      experienceYears: 0,
      consultationFee: 0,
    },
    values: doctorData
      ? {
          fullName: user?.fullName || "",
          phone: user?.phone || "",
          bio: doctorData.bio || "",
          degree: doctorData.degree || "",
          experienceYears: doctorData.experienceYears ?? 0,
          consultationFee: doctorData.consultationFee ?? 0,
        }
      : undefined,
  });

  // ── Avatar upload mutation ──────────────────────────────────────────────────
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { axiosInstance } = await import("../../utils/axios.config");
      const res = await axiosInstance.post<{ relativePath: string; absoluteUrl: string }>("/files/upload-image?folder=avatars", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.absoluteUrl;
    },
  });

  // ── Combined save mutation ──────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      let newAvatarUrl = user?.avatarUrl || null;

      // 1. Upload avatar if a new file was chosen
      if (selectedFile) {
        try {
          newAvatarUrl = await avatarMutation.mutateAsync(selectedFile);
        } catch {
          // avatar upload failed — continue saving other fields
          toast.error("Không thể tải ảnh lên. Thông tin khác vẫn được lưu.");
        }
      }

      // 2. Update basic user info (fullName, phone) via /user/me
      await userService.updateProfile({
        fullName: values.fullName,
        phone: values.phone || "",
        avatarUrl: newAvatarUrl || undefined,
      });

      // 3. Update doctor-specific info if doctorId exists
      if (doctorId && doctorData) {
        await doctorService.update(doctorId, {
          userId: doctorData.userId,
          specialtyId: doctorData.specialtyId,
          licenseNumber: doctorData.licenseNumber || "",
          isActive: doctorData.isActive !== undefined ? doctorData.isActive : true,
          bio: values.bio || undefined,
          degree: values.degree,
          yearsExperience: values.experienceYears,
          consultationFee: values.consultationFee,
        });
      }

      return { newAvatarUrl, values };
    },
    onSuccess: ({ newAvatarUrl, values }) => {
      toast.success("Cập nhật hồ sơ thành công!");
      if (user && accessToken) {
        setAuth(
          {
            ...user,
            fullName: values.fullName,
            phone: values.phone || null,
            avatarUrl: newAvatarUrl,
          },
          accessToken
        );
      }
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["doctor-profile", doctorId] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Có lỗi xảy ra khi cập nhật.";
      toast.error(msg);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB.");
        return;
      }
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (values: ProfileFormValues) => {
    saveMutation.mutate(values);
  };

  if (loadingDoctor) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Đang tải hồ sơ...</span>
      </div>
    );
  }

  const isSaving = saveMutation.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* ── Avatar Section ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#104870] to-[#2b88aa] border-4 border-white shadow-lg overflow-hidden relative">
            {avatarPreview ? (
              <img src={avatarPreview.startsWith('blob:') ? avatarPreview : getImageUrl(avatarPreview)} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">
                {(user?.fullName || "D").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
              <Camera className="w-6 h-6 text-white mb-1" />
              <span className="text-white text-[10px] font-semibold">Đổi ảnh</span>
            </div>
          </div>
          {selectedFile && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">✓</span>
            </span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-base">Ảnh đại diện</h3>
          <p className="text-sm text-slate-500 mb-2">JPG, GIF hoặc PNG. Tối đa 5MB.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-[#15718E] hover:text-[#105d76] transition-colors"
          >
            Tải ảnh mới lên
          </button>
          {selectedFile && (
            <p className="text-xs text-emerald-600 mt-1">✓ Đã chọn: {selectedFile.name}</p>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* ── Section: Thông tin cơ bản ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-[#15718E]" />
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Thông tin cơ bản</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              {...form.register("fullName")}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-2 focus:ring-[#15718E]/10 outline-none transition-all"
            />
            {form.formState.errors.fullName && (
              <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Địa chỉ Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed outline-none"
            />
            <p className="text-xs text-slate-400">Email không thể thay đổi.</p>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
            <input
              {...form.register("phone")}
              placeholder="0901234567"
              className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-2 focus:ring-[#15718E]/10 outline-none transition-all"
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section: Thông tin chuyên môn ───────────────────────────────── */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-4 h-4 text-[#15718E]" />
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Thông tin chuyên môn</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Degree */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              Bằng cấp / Học vị <span className="text-red-500">*</span>
            </label>
            <input
              {...form.register("degree")}
              placeholder="VD: Tiến sĩ Y khoa, Thạc sĩ..."
              className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-2 focus:ring-[#15718E]/10 outline-none transition-all"
            />
            {form.formState.errors.degree && (
              <p className="text-xs text-red-500">{form.formState.errors.degree.message}</p>
            )}
          </div>

          {/* Experience Years */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
              Số năm kinh nghiệm <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={60}
                {...form.register("experienceYears", { valueAsNumber: true })}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-2 focus:ring-[#15718E]/10 outline-none transition-all pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                năm
              </span>
            </div>
            {form.formState.errors.experienceYears && (
              <p className="text-xs text-red-500">{form.formState.errors.experienceYears.message}</p>
            )}
          </div>

          {/* Consultation Fee */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              Phí tư vấn <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={10000}
                {...form.register("consultationFee", { valueAsNumber: true })}
                placeholder="200000"
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-2 focus:ring-[#15718E]/10 outline-none transition-all pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                VNĐ
              </span>
            </div>
            {form.formState.errors.consultationFee && (
              <p className="text-xs text-red-500">{form.formState.errors.consultationFee.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Tiểu sử / Giới thiệu bản thân</label>
            <textarea
              {...form.register("bio")}
              rows={4}
              placeholder="Mô tả ngắn về chuyên môn, kinh nghiệm và phong cách điều trị của bạn..."
              className="w-full px-4 py-3 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-2 focus:ring-[#15718E]/10 outline-none transition-all resize-none leading-relaxed text-sm"
            />
            <div className="flex justify-between">
              {form.formState.errors.bio && (
                <p className="text-xs text-red-500">{form.formState.errors.bio.message}</p>
              )}
              <p className="text-xs text-slate-400 ml-auto">
                {(form.watch("bio") || "").length}/1000
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit Button ────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#15718E] hover:bg-[#105d76] text-white font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>
    </form>
  );
};
