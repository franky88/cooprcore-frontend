// frontend/components/shared/RoleGuard.tsx
"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "@/types/auth";
import { ROLE_HIERARCHY } from "@/lib/constants";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** If true, checks minimum role level via hierarchy instead of exact match */
  minRole?: UserRole;
}

export default function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
  minRole,
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  const role = session?.role as UserRole | undefined;

  if (status === "loading") return null;
  if (!role) return <>{fallback}</>;

  if (minRole && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole]) {
    return <>{children}</>;
  }

  if (allowedRoles.includes(role)) return <>{children}</>;

  return <>{fallback}</>;
}