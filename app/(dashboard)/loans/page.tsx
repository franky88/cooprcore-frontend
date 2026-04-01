// frontend/app/(dashboard)/loans/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoans } from '@/hooks/useLoans';
import LoanTable from '@/components/loans/LoanTable';
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
import { CreditCard, Search, PlusCircle, ChevronLeft } from 'lucide-react';
import { DEFAULT_PER_PAGE, LOAN_STATUSES } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import type { LoanStatus } from '@/types/loan';
import Link from 'next/link';
import { LoanApplicationsButton } from '@/components/loans/LoanApplicationsButton';

export default function LoansPage() {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<LoanStatus | ''>('');
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useLoans({
    page,
    per_page: DEFAULT_PER_PAGE,
    search: debouncedSearch || undefined,
    status: status || undefined,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === 'all' ? '' : (value as LoanStatus));
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/loans"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Loans
        </Link>
      </div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50">
            <CreditCard className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Loans</h2>
            {data && (
              <p className="text-xs text-slate-400">
                {data.pagination.total} total loans
              </p>
            )}
          </div>
        </div>

        <RoleGuard
          allowedRoles={['super_admin', 'branch_manager', 'loan_officer']}
        >
          <div className="flex items-center gap-2">
            <LoanApplicationsButton />
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
              onClick={() => router.push('/loans/apply')}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New Application
            </Button>
          </div>
        </RoleGuard>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by loan ID or member…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select value={status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LOAN_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <LoanTable
        result={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
