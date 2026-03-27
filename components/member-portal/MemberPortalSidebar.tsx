'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserRound,
  Wallet,
  Landmark,
  PieChart,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MemberLogoutButton from '@/components/member-portal/MemberLogoutButton';

const items = [
  { href: '/member', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/member/profile', label: 'My Profile', icon: UserRound },
  { href: '/member/loans', label: 'My Loans', icon: Wallet },
  { href: '/member/savings', label: 'My Savings', icon: Landmark },
  { href: '/member/shares', label: 'My Shares', icon: PieChart },
];

export default function MemberPortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
          <Building2 className="h-4 w-4 text-white" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            Member Portal
          </p>
          <p className="truncate text-xs text-slate-400">LUFAMCO</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active ? 'text-indigo-600' : 'text-slate-500',
                )}
              />
              <span>{item.label}</span>
              {active ? (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <MemberLogoutButton />
      </div>
    </aside>
  );
}
