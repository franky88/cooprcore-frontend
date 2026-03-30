'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import LoanApplicationTable from '@/components/loans/LoanApplicationTable';
import { useStaffLoanApplications } from '@/hooks/useLoanApplications';
import { DEFAULT_PER_PAGE } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';

export default function LoanApplicationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useStaffLoanApplications({
    page,
    per_page: DEFAULT_PER_PAGE,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

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
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-medium">Applications</span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
          <FileText className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Loan Applications
          </h2>
          {data && (
            <p className="text-xs text-slate-400">
              {data.pagination.total} total applications
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by application, member, or type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-8 pl-8 text-sm"
          />
        </div>

        <Select
          value={status || 'all'}
          onValueChange={(value) => {
            setStatus(value === 'all' ? '' : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Submitted">Submitted</SelectItem>
            <SelectItem value="Under Review">Under Review</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <LoanApplicationTable
        result={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onView={(applicationId) =>
          router.push(`/loans/applications/${applicationId}`)
        }
      />
    </div>
  );
}
