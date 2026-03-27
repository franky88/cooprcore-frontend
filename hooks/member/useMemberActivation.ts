'use client';

import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  ApiDataResponse,
  MemberActivationCompletePayload,
  MemberActivationCompleteResponse,
  MemberActivationStartPayload,
  MemberActivationStartResponse,
} from '@/types/member-auth';

export function useStartMemberActivation() {
  return useMutation<
    MemberActivationStartResponse,
    Error,
    MemberActivationStartPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<
        ApiDataResponse<MemberActivationStartResponse>
      >('/member-auth/activate/start', payload);
      return data.data;
    },
  });
}

export function useCompleteMemberActivation() {
  return useMutation<
    MemberActivationCompleteResponse,
    Error,
    MemberActivationCompletePayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<
        ApiDataResponse<MemberActivationCompleteResponse>
      >('/member-auth/activate/complete', payload);
      return data.data;
    },
  });
}
