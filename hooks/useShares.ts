// frontend/hooks/useShares.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { extractApiError } from "@/lib/api";
import type {
  ShareCapital,
  ShareFilters,
  SharePayment,
  UpdateSubscriptionPayload,
  PostSharePaymentPayload,
} from "@/types/share";
import type { PaginatedResponse } from "@/types/api";

export const shareKeys = {
  all: ["shares"] as const,
  lists: () => [...shareKeys.all, "list"] as const,
  list: (filters: ShareFilters) => [...shareKeys.lists(), filters] as const,
  details: () => [...shareKeys.all, "detail"] as const,
  detail: (id: string) => [...shareKeys.details(), id] as const,
  payments: (id: string) => [...shareKeys.detail(id), "payments"] as const,
};

export function useShares(filters: ShareFilters = {}) {
  return useQuery<PaginatedResponse<ShareCapital>>({
    queryKey: shareKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get("/shares", { params: filters });
      return data;
    },
  });
}

export function useShare(shareId: string) {
  return useQuery<ShareCapital>({
    queryKey: shareKeys.detail(shareId),
    queryFn: async () => {
      const { data } = await api.get(`/shares/${shareId}`);
      return data;
    },
    enabled: !!shareId,
  });
}

export function useSharePayments(shareId: string) {
  return useQuery<SharePayment[]>({
    queryKey: shareKeys.payments(shareId),
    queryFn: async () => {
      const { data } = await api.get(`/shares/${shareId}/payments`);
      return Array.isArray(data) ? data : (data.payments ?? []);
    },
    enabled: !!shareId,
  });
}

export function useUpdateSubscription(shareId: string) {
  const queryClient = useQueryClient();
  return useMutation<ShareCapital, Error, UpdateSubscriptionPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.put(
        `/shares/${shareId}/subscribe`,
        payload
      );
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(shareKeys.detail(shareId), updated);
      queryClient.invalidateQueries({ queryKey: shareKeys.lists() });
    },
    onError: (error) => extractApiError(error),
  });
}

export function usePostSharePayment(shareId: string) {
  const queryClient = useQueryClient();
  return useMutation<SharePayment, Error, PostSharePaymentPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post(
        `/shares/${shareId}/payments`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shareKeys.detail(shareId),
      });
      queryClient.invalidateQueries({
        queryKey: shareKeys.payments(shareId),
      });
      queryClient.invalidateQueries({ queryKey: shareKeys.lists() });
    },
    onError: (error) => extractApiError(error),
  });
}