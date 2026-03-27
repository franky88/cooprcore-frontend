// frontend/middleware.ts
// import { auth } from '@/auth';
// import { NextResponse } from 'next/server';
// import type { UserRole } from '@/types/auth';
// import { ROLE_HIERARCHY } from '@/lib/constants';

// export default auth((req: any) => {
//   const session = req.auth;
//   const role = session?.role as UserRole | undefined;
//   const pathname = req.nextUrl.pathname;

//   // Not authenticated — redirect to login
//   if (!session) {
//     return NextResponse.redirect(new URL('/login', req.url));
//   }

//   // Admin routes — super_admin only
//   if (
//     pathname.startsWith('/admin') &&
//     (!role || ROLE_HIERARCHY[role] < ROLE_HIERARCHY.super_admin)
//   ) {
//     return NextResponse.redirect(new URL('/dashboard', req.url));
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/members/:path*',
//     '/loans/:path*',
//     '/savings/:path*',
//     '/shares/:path*',
//     '/admin/:path*',
//   ],
// };

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';
import type { UserRole } from '@/types/auth';
import { ROLE_HIERARCHY } from '@/lib/constants';

type AuthenticatedRequest = NextRequest & {
  auth: Session | null;
};

const STAFF_ROUTE_PREFIXES = [
  '/dashboard',
  '/members',
  '/loans',
  '/savings',
  '/shares',
  '/admin',
];

export default auth((req: AuthenticatedRequest) => {
  const session = req.auth;
  const role = session?.role as UserRole | undefined;
  const pathname = req.nextUrl.pathname;

  const isMemberPortalRoute =
    pathname === '/member' || pathname.startsWith('/member/');

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Member portal routes: only member role allowed
  if (isMemberPortalRoute) {
    if (role !== 'member') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  }

  const isStaffRoute = STAFF_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // Block members from staff area
  if (isStaffRoute && role === 'member') {
    return NextResponse.redirect(new URL('/member', req.url));
  }

  // Admin routes: super_admin only
  if (
    pathname.startsWith('/admin') &&
    (!role || ROLE_HIERARCHY[role] < ROLE_HIERARCHY.super_admin)
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/members/:path*',
    '/loans/:path*',
    '/savings/:path*',
    '/shares/:path*',
    '/admin/:path*',
    '/member/:path*',
    '/member',
  ],
};
