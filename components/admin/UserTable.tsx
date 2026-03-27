// frontend/components/admin/UserTable.tsx
'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/shared/DataTable';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getInitials } from '@/lib/formatters';
import { ROLE_LABELS } from '@/lib/constants';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SystemUser } from '@/types/admin';
import type { UserRole } from '@/types/auth';
import type { PaginatedResponse } from '@/types/api';

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-red-50 text-red-700 border-red-200',
  branch_manager: 'bg-violet-50 text-violet-700 border-violet-200',
  loan_officer: 'bg-blue-50 text-blue-700 border-blue-200',
  cashier: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  member: 'bg-slate-50 text-slate-600 border-slate-200',
};

interface UserTableProps {
  result: PaginatedResponse<SystemUser> | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (user: SystemUser) => void;
  onToggleActive: (user: SystemUser) => void;
}

export default function UserTable({
  result,
  isLoading,
  page,
  onPageChange,
  onEdit,
  onToggleActive,
}: UserTableProps) {
  const columns: Column<SystemUser>[] = [
    {
      key: 'user',
      header: 'User',
      render: (u) => {
        const displayName = u.full_name || u.name || 'No Name';

        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback
                className={cn(
                  'text-[10px] font-semibold',
                  u.is_active
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-400',
                )}
              >
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p
                className={cn(
                  'font-medium',
                  u.is_active ? 'text-slate-900' : 'text-slate-400',
                )}
              >
                {displayName}
              </p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'employee_id',
      header: 'Employee ID',
      className: 'w-32',
      render: (u) => {
        const displayEmployeeId = u.employee_id || '—';
        return (
          <span className="text-xs font-mono text-slate-500">
            {displayEmployeeId}
          </span>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      className: 'w-40',
      render: (u) => (
        <Badge
          variant="outline"
          className={cn('text-[11px]', ROLE_COLORS[u.role])}
        >
          {ROLE_LABELS[u.role]}
        </Badge>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      className: 'w-36',
      render: (u) => {
        const displayBranch = u.branch || '—';
        return <span className="text-xs text-slate-600">{displayBranch}</span>;
      },
    },
    {
      key: 'last_login',
      header: 'Last Login',
      className: 'w-36',
      render: (u) => (
        <span className="text-xs text-slate-400">
          {u.last_login ? formatDate(u.last_login) : 'Never'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-24',
      render: (u) => (
        <Badge
          variant="outline"
          className={cn(
            'text-[11px]',
            u.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-50 text-slate-400 border-slate-200',
          )}
        >
          {u.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: (u) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(u);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7',
              u.is_active
                ? 'text-slate-400 hover:text-red-500'
                : 'text-slate-400 hover:text-emerald-500',
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(u);
            }}
          >
            {u.is_active ? (
              <ToggleRight className="h-3.5 w-3.5" />
            ) : (
              <ToggleLeft className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      <DataTable
        columns={columns}
        data={result?.data ?? []}
        isLoading={isLoading}
        keyExtractor={(u) => u.id}
        emptyMessage="No users found."
      />
      {result && (
        <Pagination
          page={result.pagination.page}
          pages={result.pagination.pages}
          total={result.pagination.total}
          perPage={result.pagination.per_page}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
