'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  ApiDataResponse,
  MemberPortalDashboard,
  MemberPortalLoan,
  MemberPortalProfile,
  MemberPortalSavings,
  MemberPortalShares,
} from '@/types/member-portal';

export function useMemberProfile() {
  return useQuery<MemberPortalProfile>({
    queryKey: ['member-portal', 'me'],
    queryFn: async () => {
      const { data } =
        await api.get<ApiDataResponse<MemberPortalProfile>>(
          '/member-portal/me',
        );
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMemberDashboard() {
  return useQuery<MemberPortalDashboard>({
    queryKey: ['member-portal', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiDataResponse<MemberPortalDashboard>>(
        '/member-portal/dashboard',
      );
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMemberLoans() {
  return useQuery<MemberPortalLoan[]>({
    queryKey: ['member-portal', 'loans'],
    queryFn: async () => {
      const { data } = await api.get<ApiDataResponse<MemberPortalLoan[]>>(
        '/member-portal/loans',
      );
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMemberSavings() {
  return useQuery<MemberPortalSavings[]>({
    queryKey: ['member-portal', 'savings'],
    queryFn: async () => {
      const { data } = await api.get<ApiDataResponse<MemberPortalSavings[]>>(
        '/member-portal/savings',
      );
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMemberShares() {
  return useQuery<MemberPortalShares | null>({
    queryKey: ['member-portal', 'shares'],
    queryFn: async () => {
      const { data } = await api.get<
        ApiDataResponse<MemberPortalShares | null>
      >('/member-portal/shares');
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}
