import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { extractApiError } from '@/lib/api';
import type {
  Member,
  MemberFilters,
  MemberSummary,
  MemberRegisterPayload,
  UpdateMemberPayload,
} from '@/types/member';
import type { PaginatedResponse } from '@/types/api';

// ── Query keys ────────────────────────────────────────────────────────────────
export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (filters: MemberFilters) => [...memberKeys.lists(), filters] as const,
  details: () => [...memberKeys.all, 'detail'] as const,
  detail: (id: string) => [...memberKeys.details(), id] as const,
  summary: (id: string) => [...memberKeys.details(), id, 'summary'] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────
export function useMembers(filters: MemberFilters = {}) {
  return useQuery<PaginatedResponse<Member>>({
    queryKey: memberKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/members', { params: filters });
      return data;
    },
  });
}

export function useMember(memberId: string) {
  return useQuery<Member>({
    queryKey: memberKeys.detail(memberId),
    queryFn: async () => {
      const { data } = await api.get(`/members/${memberId}`);
      return data;
    },
    enabled: !!memberId,
  });
}

export function useMemberSummary(memberId: string) {
  return useQuery<MemberSummary>({
    queryKey: memberKeys.summary(memberId),
    queryFn: async () => {
      const { data } = await api.get(`/members/${memberId}/summary`);
      return data;
    },
    enabled: !!memberId,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, MemberRegisterPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/members', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
    },
    onError: (error) => extractApiError(error),
  });
}

export function useUpdateMember(memberId: string) {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, UpdateMemberPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/members/${memberId}`, payload);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
      queryClient.setQueryData(memberKeys.detail(memberId), updated);
      queryClient.invalidateQueries({ queryKey: memberKeys.summary(memberId) });
    },
    onError: (error) => extractApiError(error),
  });
}

export function useDeactivateMember(memberId: string) {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, void>({
    mutationFn: async () => {
      const { data } = await api.post(`/members/${memberId}/deactivate`);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
      queryClient.setQueryData(memberKeys.detail(memberId), updated);
      queryClient.invalidateQueries({ queryKey: memberKeys.summary(memberId) });
    },
    onError: (error) => extractApiError(error),
  });
}
