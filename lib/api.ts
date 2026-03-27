// frontend/lib/api.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { signOut } from "next-auth/react";
import { API_BASE } from "./constants";

async function getSessionData(): Promise<{
  accessToken?: string;
  refreshToken?: string;
} | null> {
  if (typeof window === "undefined") return null; // skip on SSR
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "include", // ← ensure cookies are sent
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSessionData();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
let isRefreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        if (typeof window !== "undefined") {
          await signOut({ callbackUrl: "/login" });
        }
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        const session = await getSessionData();
        if (!session?.refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          null,
          {
            headers: { Authorization: `Bearer ${session.refreshToken}` },
          }
        );

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        isRefreshing = false;
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        await signOut({ callbackUrl: "/login" });
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const extractApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.error === "object") {
      return Object.values(data.error as Record<string, string[]>)
        .flat()
        .join(", ");
    }
  }
  return "An unexpected error occurred.";
};

export default api;