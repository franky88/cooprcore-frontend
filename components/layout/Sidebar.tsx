// frontend/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useSidebarCollapsed, useToggleSidebar } from '@/store/useStore';
import { ROLE_HIERARCHY } from '@/lib/constants';
import type { UserRole } from '@/types/auth';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCoopSettings } from '@/hooks/useAdmin';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  minRole?: UserRole;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Members',
    href: '/members',
    icon: Users,
  },
  {
    label: 'Loans',
    href: '/loans',
    icon: CreditCard,
  },
  {
    label: 'Savings',
    href: '/savings',
    icon: PiggyBank,
  },
  {
    label: 'Share Capital',
    href: '/shares',
    icon: TrendingUp,
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: Settings,
    minRole: 'branch_manager',
  },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        'hover:bg-slate-100 hover:text-slate-900',
        isActive
          ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700'
          : 'text-slate-600',
        collapsed && 'justify-center px-2',
      )}
    >
      <item.icon
        className={cn(
          'shrink-0 transition-colors',
          isActive ? 'text-indigo-600' : 'text-slate-500',
          collapsed ? 'h-5 w-5' : 'h-4 w-4',
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && isActive && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export default function Sidebar() {
  const collapsed = useSidebarCollapsed();
  const toggle = useToggleSidebar();
  const { data: session } = useSession();
  const role = session?.role as UserRole | undefined;
  const { data, isLoading } = useCoopSettings();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.minRole) return true;
    if (!role) return false;
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[item.minRole];
  });

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'relative flex flex-col h-screen bg-white border-r border-slate-200',
          'transition-[width] duration-200 ease-in-out shrink-0',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* ── Logo ── */}
        <div
          className={cn(
            'flex items-center h-16 border-b border-slate-200 px-4 shrink-0',
            collapsed ? 'justify-center px-2' : 'gap-2.5',
          )}
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-600 shrink-0">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {data?.coop_name?.toUpperCase() || 'LUFAMCO'}
              </p>
              <p className="text-[10px] text-slate-400 truncate leading-tight">
                Management System
              </p>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {visibleItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* ── Collapse toggle ── */}
        <div className="shrink-0 border-t border-slate-200 p-2">
          <button
            onClick={toggle}
            className={cn(
              'flex items-center w-full px-3 py-2 rounded-lg text-xs text-slate-500',
              'hover:bg-slate-100 hover:text-slate-700 transition-colors',
              collapsed ? 'justify-center' : 'gap-2',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
