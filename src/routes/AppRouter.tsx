import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";

import { PublicLayout } from "../components/layout/PublicLayout";
import { DoctorLayout } from "../components/layout/DoctorLayout";
import { HomePage } from "../pages/public/HomePage";
import { DoctorDetailPage } from "../pages/public/DoctorDetailPage";
import { DoctorListPage } from "../pages/public/DoctorListPage";
import { ProfilePage } from "../pages/patient/ProfilePage";

import { SpecialtyListPage } from "../pages/public/SpecialtyListPage";
import { ArticleListPage } from "../pages/public/ArticleListPage";
import { ArticleDetailPage } from "../pages/public/ArticleDetailPage";
import { GeneralBookingPage } from "../pages/public/GeneralBookingPage";

const NotFoundPage = () => (
  <div className="p-6 text-center text-red-500">
    <h2>❌ Lỗi 404 - Không tìm thấy trang</h2>
  </div>
);

import { PatientDashboardPage } from "../pages/patient/PatientDashboardPage";
import { AppointmentDetailPage } from "../pages/patient/AppointmentDetailPage";
import { MedicalHistoryPage } from "../pages/patient/MedicalHistoryPage";
import { BookAppointmentPage } from "../pages/patient/BookAppointmentPage";
import { MyAppointments } from "../pages/patient/MyAppointments";
import DoctorAppointmentsPage from "@/pages/doctor/DoctorAppointmentsPage";
import DoctorDashboardPage from "@/pages/doctor/DoctorDashboardPage";
import DoctorSchedulePage from "@/pages/doctor/DoctorSchedulePage";
import PatientRecordsPage from "@/pages/doctor/PatientRecordsPage";
import CreateMedicalRecordPage from "@/pages/doctor/CreateMedicalRecordPage";
import DoctorProfilePage from "@/pages/doctor/DoctorProfilePage";
import DoctorArticlesPage from "@/pages/doctor/DoctorArticlesPage";


// === CÁC TRANG DÀNH CHO BÁC SĨ (ROLE: DOCTOR) ===
import { AdminLayout } from "../components/layout/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import DoctorManagementPage from "../pages/admin/DoctorManagementPage";
import SpecialtyManagementPage from "../pages/admin/SpecialtyManagementPage";
import ServiceManagementPage from "../pages/admin/ServiceManagementPage";
import ArticleManagementPage from "../pages/admin/ArticleManagementPage";
import { ReceptionPage } from "../pages/admin/ReceptionPage";

// === CÁC TRANG DÀNH CHO QUẢN TRỊ VIÊN (ROLE: ADMIN) ===

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* 1. Tuyến đường công khai (Public Routes) có Header/Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/doctors" element={<DoctorListPage />} />
          <Route path="/specialties" element={<SpecialtyListPage />} />
          <Route path="/articles" element={<ArticleListPage />} />
          <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          <Route path="/doctors/:id" element={<DoctorDetailPage />} />
          <Route path="/book-general" element={<GeneralBookingPage />} />
          <Route path="/book-doctor" element={<BookAppointmentPage />} />
        </Route>


        {/* 2. Tuyến đường dành cho khách (Chưa đăng nhập) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 3. Tuyến đường bảo vệ cho BỆNH NHÂN */}
        <Route element={<ProtectedRoute allowedRoles={["Patient"]} />}>
          <Route element={<PublicLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
            <Route path="/patient/records" element={<MyAppointments />} />
            <Route path="/patient/appointments/:id" element={<AppointmentDetailPage />} />
            <Route path="/patient/medical-history" element={<MedicalHistoryPage />} />
            <Route path="/patient/settings" element={<ProfilePage />} />
            {/* Redirects from old routes */}
            <Route path="/patient/book-appointment" element={<Navigate to="/book-doctor" replace />} />
            <Route path="/patient/book" element={<Navigate to="/book-doctor" replace />} />
            <Route path="/patient/appointments" element={<Navigate to="/patient/records" replace />} />
            <Route path="/patient/profile" element={<Navigate to="/patient/settings" replace />} />
          </Route>
        </Route>

        {/* 4. Tuyến đường bảo vệ cho BÁC SĨ */}
        <Route element={<ProtectedRoute allowedRoles={["Doctor"]} />}>
          <Route element={<DoctorLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
            <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
            <Route path="/doctor/schedule" element={<DoctorSchedulePage />} />
            <Route path="/doctor/patient-records" element={<PatientRecordsPage />} />
            <Route path="/doctor/records/create/:id" element={<CreateMedicalRecordPage />} />
            <Route path="/doctor/profile" element={<DoctorProfilePage />} />
            <Route path="/doctor/articles" element={<DoctorArticlesPage />} />
          </Route>
        </Route>

        {/* 5. Tuyến đường bảo vệ cho ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/doctors" element={<DoctorManagementPage />} />
            <Route path="/admin/specialties" element={<SpecialtyManagementPage />} />
            <Route path="/admin/services" element={<ServiceManagementPage />} />
            <Route path="/admin/articles" element={<ArticleManagementPage />} />
            <Route path="/admin/reception" element={<ReceptionPage />} />
          </Route>
        </Route>

        {/* Tuyến đường mặc định khi lỗi */}
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
