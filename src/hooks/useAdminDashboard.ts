import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => dashboardService.getSummary(),
    refetchInterval: 5 * 60 * 1000, // 5 phút
  });
}

export function useAdminDashboardChart(days: number = 30) {
  return useQuery({
    queryKey: ['admin-dashboard-chart', days],
    queryFn: () => dashboardService.getAppointmentsByDay(days),
  });
}

export function useAdminDashboardTopDoctors(limit: number = 5) {
  return useQuery({
    queryKey: ['admin-dashboard-top-doctors', limit],
    queryFn: () => dashboardService.getTopDoctors(limit),
  });
}
