// frontend/app/(dashboard)/admin/users/page.tsx
'use client';

import { useState } from 'react';
import { useSystemUsers, useCreateUser, useUpdateUser } from '@/hooks/useAdmin';
import UserTable from '@/components/admin/UserTable';
import UserForm from '@/components/admin/UserForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, UserPlus, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useAddNotification } from '@/store/useStore';
import { extractApiError } from '@/lib/api';
import { ROLE_LABELS, DEFAULT_PER_PAGE } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import type {
  SystemUser,
  CreateUserPayload,
  UpdateUserPayload,
} from '@/types/admin';
import type { UserRole } from '@/types/auth';

export default function AdminUsersPage() {
  const addNotification = useAddNotification();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useSystemUsers({
    page,
    per_page: DEFAULT_PER_PAGE,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
  });

  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: updateUser } = useUpdateUser(editingUser?.id ?? '');

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleToggleActive = async (user: SystemUser) => {
    try {
      await updateUser({ is_active: !user.is_active });
      addNotification({
        type: 'success',
        title: `User ${user.is_active ? 'deactivated' : 'activated'}`,
        message: user.full_name || user.name || user.email,
        minRole: 'super_admin',
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Update failed',
        message: extractApiError(e),
        minRole: 'super_admin',
      });
    }
  };

  const handleCreateUser = async (payload: CreateUserPayload) => {
    try {
      await createUser(payload);
      addNotification({
        type: 'success',
        title: 'User created',
        message: `${payload.full_name} has been added.`,
        minRole: 'super_admin',
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Failed to create user',
        message: extractApiError(e),
        minRole: 'super_admin',
      });
      throw e;
    }
  };

  const handleUpdateUser = async (payload: UpdateUserPayload) => {
    try {
      await updateUser(payload);
      addNotification({
        type: 'success',
        title: 'User updated successfully',
        minRole: 'super_admin',
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Update failed',
        message: extractApiError(e),
        minRole: 'super_admin',
      });
      throw e;
    }
  };

  const roles = Object.entries(ROLE_LABELS) as [UserRole, string][];

  return (
    <div className="space-y-5">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Admin
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-medium">System Users</span>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              System Users
            </h2>
            {data && (
              <p className="text-xs text-slate-400">
                {data.pagination.total} total users
              </p>
            )}
          </div>
        </div>

        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
          onClick={handleCreate}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add User
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select
          value={roleFilter || 'all'}
          onValueChange={(v) => {
            setRoleFilter(v === 'all' ? '' : (v as UserRole));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <UserTable
        result={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
      />

      {/* ── Form modal ── */}
      <UserForm
        open={formOpen}
        user={editingUser}
        onClose={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        onCreate={handleCreateUser}
        onUpdate={handleUpdateUser}
      />
    </div>
  );
}
