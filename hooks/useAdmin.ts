// frontend/hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { extractApiError } from "@/lib/api";
import type {
  SystemUser,
  AuditLog,
  CoopSettings,
  CreateUserPayload,
  UpdateUserPayload,
  UserFilters,
  AuditLogFilters,
} from "@/types/admin";
import type { PaginatedResponse } from "@/types/api";

export const adminKeys = {
  all: ["admin"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  userList: (filters: UserFilters) =>
    [...adminKeys.users(), filters] as const,
  user: (id: string) => [...adminKeys.users(), id] as const,
  auditLogs: () => [...adminKeys.all, "audit-logs"] as const,
  auditLog: (filters: AuditLogFilters) =>
    [...adminKeys.auditLogs(), filters] as const,
  settings: () => [...adminKeys.all, "settings"] as const,
};

// ── Users ─────────────────────────────────────────────────────────────────────

export function useSystemUsers(filters: UserFilters = {}) {
  return useQuery<PaginatedResponse<SystemUser>>({
    queryKey: adminKeys.userList(filters),
    queryFn: async () => {
      const { data } = await api.get("/admin/users", { params: filters });
      return data;
    },
  });
}

export function useSystemUser(userId: string) {
  return useQuery<SystemUser>({
    queryKey: adminKeys.user(userId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation<SystemUser, Error, CreateUserPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/admin/users", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (error) => extractApiError(error),
  });
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation<SystemUser, Error, UpdateUserPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/admin/users/${userId}`, payload);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(adminKeys.user(userId), updated);
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (error) => extractApiError(error),
  });
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery<PaginatedResponse<AuditLog>>({
    queryKey: adminKeys.auditLog(filters),
    queryFn: async () => {
      const { data } = await api.get("/admin/audit-logs", { params: filters });
      return data;
    },
  });
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function useCoopSettings() {
  return useQuery<CoopSettings>({
    queryKey: adminKeys.settings(),
    queryFn: async () => {
      const { data } = await api.get("/admin/settings");
      return data;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes — settings don't change often
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation<CoopSettings, Error, Partial<CoopSettings>>({
    mutationFn: async (payload) => {
      const { data } = await api.put("/admin/settings", payload);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(adminKeys.settings(), updated);
    },
    onError: (error) => extractApiError(error),
  });
}