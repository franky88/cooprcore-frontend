// frontend/hooks/useReports.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  MembersReport,
  LoansReport,
  SavingsReport,
  SharesReport,
} from "@/types/reports";

export const reportKeys = {
  all: ["reports"] as const,
  members: (params?: Record<string, string>) =>
    [...reportKeys.all, "members", params] as const,
  loans: (params?: Record<string, string>) =>
    [...reportKeys.all, "loans", params] as const,
  savings: (params?: Record<string, string>) =>
    [...reportKeys.all, "savings", params] as const,
  shares: () => [...reportKeys.all, "shares"] as const,
};

export function useMembersReport(
  params: { status?: string; membership_type?: string } = {}
) {
  return useQuery<MembersReport>({
    queryKey: reportKeys.members(params as Record<string, string>),
    queryFn: async () => {
      const { data } = await api.get("/admin/reports/members", {
        params,
      });
      return data;
    },
  });
}

export function useLoansReport(params: { status?: string } = {}) {
  return useQuery<LoansReport>({
    queryKey: reportKeys.loans(params as Record<string, string>),
    queryFn: async () => {
      const { data } = await api.get("/admin/reports/loans", { params });
      return data;
    },
  });
}

export function useSavingsReport(
  params: { product_type?: string } = {}
) {
  return useQuery<SavingsReport>({
    queryKey: reportKeys.savings(params as Record<string, string>),
    queryFn: async () => {
      const { data } = await api.get("/admin/reports/savings", { params });
      return data;
    },
  });
}

export function useSharesReport() {
  return useQuery<SharesReport>({
    queryKey: reportKeys.shares(),
    queryFn: async () => {
      const { data } = await api.get("/admin/reports/shares");
      return data;
    },
  });
}