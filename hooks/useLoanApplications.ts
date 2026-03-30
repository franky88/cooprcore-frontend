'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  ApiDataResponse,
  LoanApplication,
  LoanApplicationApprovePayload,
  LoanApplicationCreatePayload,
  LoanApplicationRejectPayload,
  LoanApplicationReviewPayload,
  PaginatedResponse,
} from '@/types/loan-application';

export interface LoanApplicationFilters {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}

export const loanApplicationKeys = {
  all: ['loan-applications'] as const,
  staffLists: () => [...loanApplicationKeys.all, 'staff-list'] as const,
  staffList: (filters: LoanApplicationFilters) =>
    [...loanApplicationKeys.staffLists(), filters] as const,
  staffDetails: () => [...loanApplicationKeys.all, 'staff-detail'] as const,
  staffDetail: (applicationId: string) =>
    [...loanApplicationKeys.staffDetails(), applicationId] as const,

  memberLists: () => [...loanApplicationKeys.all, 'member-list'] as const,
  memberList: () => [...loanApplicationKeys.memberLists()] as const,
  memberDetail: (applicationId: string) =>
    [...loanApplicationKeys.all, 'member-detail', applicationId] as const,
};

export function useStaffLoanApplications(filters: LoanApplicationFilters = {}) {
  return useQuery<PaginatedResponse<LoanApplication[]>>({
    queryKey: loanApplicationKeys.staffList(filters),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<LoanApplication[]>>(
        '/loans/applications',
        { params: filters },
      );
      return data;
    },
  });
}

export function useStaffLoanApplication(applicationId: string) {
  return useQuery<LoanApplication>({
    queryKey: loanApplicationKeys.staffDetail(applicationId),
    queryFn: async () => {
      const { data } = await api.get<ApiDataResponse<LoanApplication>>(
        `/loans/applications/${applicationId}`,
      );
      return data.data;
    },
    enabled: !!applicationId,
  });
}

export function useReviewLoanApplication(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation<LoanApplication, Error, LoanApplicationReviewPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.put<ApiDataResponse<LoanApplication>>(
        `/loans/applications/${applicationId}/review`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: loanApplicationKeys.staffLists(),
      });
      queryClient.invalidateQueries({
        queryKey: loanApplicationKeys.staffDetail(applicationId),
      });
    },
  });
}

export function useRejectLoanApplication(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation<LoanApplication, Error, LoanApplicationRejectPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.put<ApiDataResponse<LoanApplication>>(
        `/loans/applications/${applicationId}/reject`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: loanApplicationKeys.staffLists(),
      });
      queryClient.invalidateQueries({
        queryKey: loanApplicationKeys.staffDetail(applicationId),
      });
    },
  });
}

export function useApproveLoanApplication(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { application: LoanApplication; loan: Record<string, unknown> },
    Error,
    LoanApplicationApprovePayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.put<
        ApiDataResponse<{
          application: LoanApplication;
          loan: Record<string, unknown>;
        }>
      >(`/loans/applications/${applicationId}/approve`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: loanApplicationKeys.staffLists(),
      });
      queryClient.invalidateQueries({
        queryKey: loanApplicationKeys.staffDetail(applicationId),
      });
    },
  });
}

export function useMemberLoanApplications() {
  return useQuery<LoanApplication[]>({
    queryKey: loanApplicationKeys.memberList(),
    queryFn: async () => {
      const { data } = await api.get<ApiDataResponse<LoanApplication[]>>(
        '/member-portal/loan-applications',
      );
      return data.data;
    },
  });
}

export function useMemberLoanApplication(applicationId: string) {
  return useQuery<LoanApplication>({
    queryKey: loanApplicationKeys.memberDetail(applicationId),
    queryFn: async () => {
      const { data } = await api.get<ApiDataResponse<LoanApplication>>(
        `/member-portal/loan-applications/${applicationId}`,
      );
      return data.data;
    },
    enabled: !!applicationId,
  });
}

export function useCreateMemberLoanApplication() {
  const queryClient = useQueryClient();

  return useMutation<LoanApplication, Error, LoanApplicationCreatePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<ApiDataResponse<LoanApplication>>(
        '/member-portal/loan-applications',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: loanApplicationKeys.memberLists(),
      });
    },
  });
}
