"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export function useChangePassword() {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.put<ChangePasswordResponse>(
        "/users/me/change-password",
        payload
      );
      return data;
    },
  });
}