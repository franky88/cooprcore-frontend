// frontend/hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DashboardSummary } from "@/types/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
};

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: dashboardKeys.summary(),
    queryFn: async () => {
      const { data } = await api.get("/admin/dashboard");
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 minutes
    staleTime: 60 * 1000,           // consider stale after 1 minute
  });
}