import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";

import { userService } from "../../services/user.service";
import { patientService } from "../../services/patient.service";
import type { PatientDto } from "../../models/api.model";
import { getImageUrl } from "../../utils/image";

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ (10 số)").optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: PatientDto;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialData }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData.fullName || "",
      phone: initialData.phone || "",
      dateOfBirth: initialData.dateOfBirth || "",
      gender: initialData.gender || "",
      address: initialData.address || "",
      bloodType: initialData.bloodType || "",
      allergies: initialData.allergies || "",
    },
  });

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

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      let finalAvatarUrl = data.avatarUrl;
      if (selectedFile) {
        try {
          finalAvatarUrl = await avatarMutation.mutateAsync(selectedFile);
        } catch {
          toast.error("Không thể tải ảnh lên. Thông tin khác vẫn được lưu.");
        }
      }

      // 1. Update User info (FullName, Phone, Avatar)
      await userService.updateProfile({
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: finalAvatarUrl
      });
      // 2. Update Patient info (DOB, Gender, BloodType, Allergies, Address)
      await patientService.updatePatient(initialData.id, {
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodType: data.bloodType,
        allergies: data.allergies,
        address: data.address
      });
    },
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công!");
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["patientMe"] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Có lỗi xảy ra khi cập nhật.";
      toast.error(msg);
    }
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
      toast.success("Đã chọn ảnh mới. Vui lòng nhấn Lưu thay đổi.");
    }
  };

  const onSubmit = (values: ProfileFormValues) => {
    const payload = {
      ...values,
      fullName: values.fullName || "",
      avatarUrl: avatarPreview || undefined
    };
    updateMutation.mutate(payload);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden relative">
            {avatarPreview ? (
              <img src={avatarPreview.startsWith('blob:') ? avatarPreview : getImageUrl(avatarPreview)} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500 font-bold text-2xl">
                {(initialData.fullName || "User").charAt(0).toUpperCase()}
              </div>
            )}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Ảnh đại diện</h3>
          <p className="text-sm text-slate-500 mb-2">JPG, GIF hoặc PNG. Tối đa 5MB.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-[#15718E] hover:text-[#105d76]"
          >
            Tải ảnh mới lên
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Họ và tên *</label>
          <input
            {...form.register("fullName")}
            className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] outline-none transition-colors"
          />
          {form.formState.errors.fullName && (
            <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
          )}
        </div>

        {/* Email (Read only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Địa chỉ Email</label>
          <input
            value={initialData.email}
            disabled
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
          <input
            {...form.register("phone")}
            className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] outline-none transition-colors"
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Ngày sinh</label>
          <input
            type="date"
            {...form.register("dateOfBirth")}
            className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] outline-none transition-colors"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Giới tính</label>
          <select
            {...form.register("gender")}
            className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] outline-none transition-colors appearance-none bg-white"
          >
            <option value="">Chọn giới tính</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
            <option value="Other">Khác</option>
          </select>
        </div>

        {/* Blood Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Nhóm máu</label>
          <select
            {...form.register("bloodType")}
            className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] outline-none transition-colors appearance-none bg-white"
          >
            <option value="">Chọn nhóm máu</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </select>
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
          <input
            {...form.register("address")}
            className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] outline-none transition-colors"
          />
        </div>

        {/* Allergies */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Dị ứng (nếu có)</label>
          <textarea
            {...form.register("allergies")}
            rows={3}
            className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:border-[#15718E] focus:ring-1 focus:ring-[#15718E] outline-none transition-colors resize-none"
            placeholder="Nhập thông tin các loại thuốc hoặc thức ăn bạn bị dị ứng..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-6 py-2.5 font-medium text-[#15718E] bg-white border border-[#15718E] hover:bg-blue-50 rounded-lg transition-colors flex items-center disabled:opacity-70"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </button>
      </div>
    </form>
  );
};
