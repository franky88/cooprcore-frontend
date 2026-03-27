// frontend/app/(dashboard)/members/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMembers } from '@/hooks/useMembers';
import MemberTable from '@/components/members/MemberTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RoleGuard from '@/components/shared/RoleGuard';
import { UserPlus, Search, Users } from 'lucide-react';
import type { MemberStatus } from '@/types/member';
import { DEFAULT_PER_PAGE } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';

export default function MembersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MemberStatus | ''>('');
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useMembers({
    page,
    per_page: DEFAULT_PER_PAGE,
    search: debouncedSearch || undefined,
    status: status || undefined,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // reset to page 1 on new search
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as MemberStatus | '');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Members</h2>
            {data && (
              <p className="text-xs text-slate-400">
                {data.pagination.total} total members
              </p>
            )}
          </div>
        </div>

        <RoleGuard
          allowedRoles={['super_admin', 'branch_manager', 'loan_officer']}
        >
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
            onClick={() => router.push('/members/register')}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Register Member
          </Button>
        </RoleGuard>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by name, ID, or phone…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select value={status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
            <SelectItem value="Deceased">Deceased</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <MemberTable
        result={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
