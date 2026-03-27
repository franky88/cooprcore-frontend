// frontend/components/providers/SessionProvider.tsx
"use client";

import {
  SessionProvider as NextAuthSessionProvider,
  useSession,
} from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";

function SessionExpiryWatcher() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (
      status === "authenticated" &&
      (session as Session & { error?: string })?.error === "RefreshTokenExpired"
    ) {
      router.replace("/login");
    }
  }, [status, session, router]);

  return null;
}

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

export function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session}>
      <SessionExpiryWatcher />
      {children}
    </NextAuthSessionProvider>
  );
}