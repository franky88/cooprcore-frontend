// frontend/store/useStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UserRole } from "@/types/auth";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, "id" | "timestamp">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export interface AppNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  timestamp: number;
  minRole?: UserRole; // ← new: if set, only users with this role or above can see it
}

type StoreState = UIState & NotificationState;

export const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      // ── UI ─────────────────────────────────────────────────────────────────
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),

      // ── Notifications ──────────────────────────────────────────────────────
      notifications: [],
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            ...s.notifications,
            {
              ...n,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),
      removeNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    { name: "coopcore-store" }
  )
);

// ── Selectors ─────────────────────────────────────────────────────────────────
export const useSidebarCollapsed = () =>
  useStore((s) => s.sidebarCollapsed);
export const useToggleSidebar = () =>
  useStore((s) => s.toggleSidebar);
export const useNotifications = () =>
  useStore((s) => s.notifications);
export const useAddNotification = () =>
  useStore((s) => s.addNotification);