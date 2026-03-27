"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ProfileResponse } from "@/types/profile";

export function useProfile() {
  return useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get<ProfileResponse>("/auth/me");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}