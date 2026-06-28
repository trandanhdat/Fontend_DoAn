import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { type UserRole } from "../models/auth.model";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. Kiểm tra đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Kiểm tra phân quyền (Role)
  if (allowedRoles && user.roles) {
    const hasRole = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      // Nếu sai Role, điều hướng về trang tương ứng hoặc trang 403 / trang chủ
      return <Navigate to="/not-found" replace />;
    }
  }

  // Nếu hợp lệ, cho phép render các route con bên trong
  return <Outlet />;
};
