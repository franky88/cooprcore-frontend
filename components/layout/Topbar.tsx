// frontend/components/layout/Topbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell, LogOut, User, ChevronDown, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, ROLE_HIERARCHY } from "@/lib/constants";
import { getInitials } from "@/lib/formatters";
import { useNotifications, useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";
import type { AppNotification } from "@/store/useStore";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";

// ── Page title map ────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/members": "Members",
  "/loans": "Loans",
  "/savings": "Savings & Deposits",
  "/shares": "Share Capital",
  "/admin": "Administration",
};

function usePageTitle(): string {
  const pathname = usePathname();
  const match = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([prefix]) => pathname.startsWith(prefix));
  return match?.[1] ?? "CoopCore";
}

// ── Notification helpers ──────────────────────────────────────────────────────

const NOTIFICATION_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const NOTIFICATION_ICON_STYLES = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

const NOTIFICATION_BG = {
  success: "bg-emerald-50",
  error: "bg-red-50",
  warning: "bg-amber-50",
  info: "bg-blue-50",
};

function canSeeNotification(
  notification: AppNotification,
  userRole: UserRole | undefined
): boolean {
  if (!notification.minRole) return true; // no restriction
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[notification.minRole];
}

function NotificationItem({ n }: { n: AppNotification }) {
  const removeNotification = useStore((s) => s.removeNotification);
  const Icon = NOTIFICATION_ICONS[n.type];

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 px-3 py-2.5 rounded-lg mx-1",
        NOTIFICATION_BG[n.type]
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0 mt-0.5",
          NOTIFICATION_ICON_STYLES[n.type]
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 leading-tight">
          {n.title}
        </p>
        {n.message && (
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {n.message}
          </p>
        )}
        {n.minRole && (
          <p className="text-[10px] text-slate-300 mt-0.5 uppercase tracking-wide">
            {ROLE_LABELS[n.minRole]}+
          </p>
        )}
      </div>
      <button
        onClick={() => removeNotification(n.id)}
        className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 text-xs mt-0.5"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Topbar() {
  const { data: session } = useSession();
  const title = usePageTitle();
  const role = session?.role as UserRole | undefined;
  const userName = session?.user?.name ?? "User";

  const allNotifications = useNotifications();
  const clearNotifications = useStore((s) => s.clearNotifications);
  const removeNotification = useStore((s) => s.removeNotification);

  // ← Filter by role before rendering
  const visibleNotifications = useMemo(
    () => allNotifications.filter((n) => canSeeNotification(n, role)),
    [allNotifications, role]
  );

  const hasNotifications = visibleNotifications.length > 0;

  // Clear only the notifications visible to this user
  const handleClearVisible = () => {
    visibleNotifications.forEach((n) => removeNotification(n.id));
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-2">

        {/* ── Bell notification dropdown ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-500 hover:text-slate-700"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80 p-0 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-700">
                Notifications
                {hasNotifications && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-600 text-[10px] text-white font-bold">
                    {visibleNotifications.length}
                  </span>
                )}
              </p>
              {hasNotifications && (
                <button
                  onClick={handleClearVisible}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <CheckCheck className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto py-1.5 space-y-1">
              {visibleNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Bell className="h-6 w-6 text-slate-200" />
                  <p className="text-xs text-slate-400">No notifications</p>
                </div>
              ) : (
                visibleNotifications
                  .slice()
                  .reverse()
                  .map((n) => <NotificationItem key={n.id} n={n} />)
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── User menu ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 px-2 h-9 hover:bg-slate-100"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[11px] bg-indigo-100 text-indigo-700 font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium text-slate-800 leading-none">
                  {userName}
                </p>
                {role && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {ROLE_LABELS[role]}
                  </p>
                )}
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-slate-900">
                  {userName}
                </p>
                <p className="text-xs text-slate-500">
                  {session?.user?.email}
                </p>
                {role && (
                  <Badge
                    variant="secondary"
                    className="w-fit text-[10px] mt-0.5"
                  >
                    {ROLE_LABELS[role]}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2 text-slate-600 cursor-pointer">
              <Link href="/profile">
                <User className="h-3.5 w-3.5" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}