// frontend/hooks/useSavings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { extractApiError } from "@/lib/api";
import type {
  SavingsAccount,
  SavingsFilters,
  SavingsTransaction,
  PostTransactionPayload,
  PostInterestPayload,
  CloseAccountPayload,
} from "@/types/savings";
import type { PaginatedResponse } from "@/types/api";

export const savingsKeys = {
  all: ["savings"] as const,
  lists: () => [...savingsKeys.all, "list"] as const,
  list: (filters: SavingsFilters) =>
    [...savingsKeys.lists(), filters] as const,
  details: () => [...savingsKeys.all, "detail"] as const,
  detail: (id: string) => [...savingsKeys.details(), id] as const,
  ledger: (id: string) => [...savingsKeys.detail(id), "ledger"] as const,
};

export function useSavingsAccounts(filters: SavingsFilters = {}) {
  return useQuery<PaginatedResponse<SavingsAccount>>({
    queryKey: savingsKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get("/savings", { params: filters });
      return data;
    },
  });
}

export function useSavingsAccount(accountId: string) {
  return useQuery<SavingsAccount>({
    queryKey: savingsKeys.detail(accountId),
    queryFn: async () => {
      const { data } = await api.get(`/savings/${accountId}`);
      return data;
    },
    enabled: !!accountId,
  });
}

export function useSavingsLedger(accountId: string) {
  return useQuery<SavingsTransaction[]>({
    queryKey: savingsKeys.ledger(accountId),
    queryFn: async () => {
      const { data } = await api.get(`/savings/${accountId}/ledger`);
      return Array.isArray(data) ? data : (data.data ?? []);
    },
    enabled: !!accountId,
  });
}

export function usePostTransaction(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation<SavingsTransaction, Error, PostTransactionPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post(
        `/savings/${accountId}/transactions`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: savingsKeys.detail(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: savingsKeys.ledger(accountId),
      });
      queryClient.invalidateQueries({ queryKey: savingsKeys.lists() });
    },
    onError: (error) => extractApiError(error),
  });
}

export function usePostInterest(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation<SavingsTransaction, Error, PostInterestPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/savings/interest`, {
        account_id: accountId,
        ...payload,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: savingsKeys.detail(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: savingsKeys.ledger(accountId),
      });
    },
    onError: (error) => extractApiError(error),
  });
}

export function useCloseAccount(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation<SavingsAccount, Error, CloseAccountPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.put(
        `/savings/${accountId}/close`,
        payload
      );
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(savingsKeys.detail(accountId), updated);
      queryClient.invalidateQueries({ queryKey: savingsKeys.lists() });
    },
    onError: (error) => extractApiError(error),
  });
}