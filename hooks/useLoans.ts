// frontend/hooks/useLoans.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { extractApiError } from "@/lib/api";
import type {
  Loan,
  LoanFilters,
  LoanPayment,
  AmortizationSchedule,
  LoanApplicationPayload,
  PostPaymentPayload,
  RejectPayload,
  ReleasePayload,
} from "@/types/loan";
import type { PaginatedResponse } from "@/types/api";

export const loanKeys = {
  all: ["loans"] as const,
  lists: () => [...loanKeys.all, "list"] as const,
  list: (filters: LoanFilters) => [...loanKeys.lists(), filters] as const,
  details: () => [...loanKeys.all, "detail"] as const,
  detail: (id: string) => [...loanKeys.details(), id] as const,
  payments: (id: string) => [...loanKeys.detail(id), "payments"] as const,
  schedule: (id: string) => [...loanKeys.detail(id), "schedule"] as const,
  calculator: (principal: number, rate: number, term: number) =>
    [...loanKeys.all, "calculator", principal, rate, term] as const,
};

export function useLoans(filters: LoanFilters = {}) {
  return useQuery<PaginatedResponse<Loan>>({
    queryKey: loanKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get("/loans", { params: filters });
      return data;
    },
  });
}

export function useLoan(loanId: string) {
  return useQuery<Loan>({
    queryKey: loanKeys.detail(loanId),
    queryFn: async () => {
      const { data } = await api.get(`/loans/${loanId}`);
      return data;
    },
    enabled: !!loanId,
  });
}

// export function useLoanPayments(loanId: string) {
//   return useQuery<LoanPayment[]>({
//     queryKey: loanKeys.payments(loanId),
//     queryFn: async () => {
//       const { data } = await api.get(`/loans/${loanId}/payments`);
//       return data;
//     },
//     enabled: !!loanId,
//   });
// }

export function useLoanPayments(loanId: string) {
  return useQuery<LoanPayment[]>({
    queryKey: loanKeys.payments(loanId),
    queryFn: async () => {
      const { data } = await api.get(`/loans/${loanId}/payments`);
      // Handle both array and paginated envelope
      if (data?.payments) return data.payments;
      return Array.isArray(data) ? data : (data.data ?? []);
    },
    enabled: !!loanId,
  });
}

export function useAmortizationSchedule(loanId: string) {
  return useQuery<AmortizationSchedule>({
    queryKey: loanKeys.schedule(loanId),
    queryFn: async () => {
      const { data } = await api.get(`/loans/${loanId}/schedule`);
      return data;
    },
    enabled: !!loanId,
  });
}

export function useCalculateAmortization(
  principal: number,
  rate: number,
  term: number
) {
  return useQuery<AmortizationSchedule>({
    queryKey: loanKeys.calculator(principal, rate, term),
    queryFn: async () => {
      const { data } = await api.get("/loans/calculator", {
        params: { principal, rate, term },
      });
      return data;
    },
    enabled: principal > 0 && rate > 0 && term > 0,
    staleTime: Infinity, // computed values don't change
  });
}

export function useApplyLoan() {
  const queryClient = useQueryClient();
  return useMutation<Loan, Error, LoanApplicationPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/loans", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
    onError: (error) => extractApiError(error),
  });
}

export function useApproveLoan(loanId: string) {
  const queryClient = useQueryClient();
  return useMutation<Loan, Error, void>({
    mutationFn: async () => {
      const { data } = await api.put(`/loans/${loanId}/approve`);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(loanKeys.detail(loanId), updated);
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
  });
}

export function useRejectLoan(loanId: string) {
  const queryClient = useQueryClient();
  return useMutation<Loan, Error, RejectPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/loans/${loanId}/reject`, payload);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(loanKeys.detail(loanId), updated);
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
  });
}

export function useReleaseLoan(loanId: string) {
  const queryClient = useQueryClient();
  return useMutation<Loan, Error, ReleasePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/loans/${loanId}/release`, payload);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(loanKeys.detail(loanId), updated);
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
  });
}

export function usePostPayment(loanId: string) {
  const queryClient = useQueryClient();
  return useMutation<LoanPayment, Error, PostPaymentPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/loans/${loanId}/payments`, payload);
      console.log("data", data)
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.payments(loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
  });
}