'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

function getPageTitle(pathname: string) {
  if (pathname === '/member') return 'Dashboard';
  if (pathname === '/member/profile') return 'My Profile';
  if (pathname === '/member/loans') return 'My Loans';
  if (pathname === '/member/savings') return 'My Savings';
  if (pathname === '/member/shares') return 'My Shares';
  return 'Member Portal';
}

function getPageDescription(pathname: string) {
  if (pathname === '/member') return 'Overview of your cooperative account';
  if (pathname === '/member/profile') return 'View your member information';
  if (pathname === '/member/loans')
    return 'Track your loan applications and balances';
  if (pathname === '/member/savings') return 'View your savings accounts';
  if (pathname === '/member/shares') return 'Monitor your share capital';
  return 'Member self-service portal';
}

export default function MemberPortalTopbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const pageTitle = getPageTitle(pathname);
  const pageDescription = getPageDescription(pathname);
  const memberName = session?.user?.name || 'Member';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="min-w-0">
        <h1 className="text-base font-semibold text-slate-900">{pageTitle}</h1>
        <p className="text-xs text-slate-400">{pageDescription}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">{memberName}</p>
          <p className="text-xs text-slate-400">Portal Account</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
          {memberName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
