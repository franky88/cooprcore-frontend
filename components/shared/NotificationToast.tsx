// frontend/components/shared/NotificationToast.tsx
"use client";

import { useEffect } from "react";
import { useStore, useNotifications, useAddNotification } from "@/store/useStore";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import type { AppNotification } from "@/store/useStore";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: "bg-white border-emerald-200 text-emerald-800",
  error: "bg-white border-red-200 text-red-800",
  warning: "bg-white border-amber-200 text-amber-800",
  info: "bg-white border-blue-200 text-blue-800",
};

const ICON_STYLES = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

const AUTO_DISMISS_MS = 4000;

function Toast({ notification }: { notification: AppNotification }) {
  const removeNotification = useStore((s) => s.removeNotification);
  const Icon = ICONS[notification.type];

  useEffect(() => {
    const timer = setTimeout(
      () => removeNotification(notification.id),
      AUTO_DISMISS_MS
    );
    return () => clearTimeout(timer);
  }, [notification.id, removeNotification]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-80 px-4 py-3 rounded-lg border shadow-md",
        "animate-in slide-in-from-right-5 fade-in duration-200",
        STYLES[notification.type]
      )}
    >
      <Icon
        className={cn("h-4 w-4 shrink-0 mt-0.5", ICON_STYLES[notification.type])}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs mt-0.5 opacity-80 leading-snug">
            {notification.message}
          </p>
        )}
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function NotificationToast() {
  const notifications = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} />
      ))}
    </div>
  );
}