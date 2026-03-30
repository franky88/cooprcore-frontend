'use client';

import { Badge } from '@/components/ui/badge';
import DataTable, { type Column } from '@/components/shared/DataTable';
import Pagination from '@/components/shared/Pagination';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type {
  LoanApplication,
  PaginatedResponse,
} from '@/types/loan-application';

interface LoanApplicationTableProps {
  result: PaginatedResponse<LoanApplication[]> | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onView: (applicationId: string) => void;
}

function getStatusClass(status: LoanApplication['status']) {
  switch (status) {
    case 'Submitted':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'Under Review':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'Approved':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Rejected':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

export default function LoanApplicationTable({
  result,
  isLoading,
  page,
  onPageChange,
  onView,
}: LoanApplicationTableProps) {
  const columns: Column<LoanApplication>[] = [
    {
      key: 'application_id',
      header: 'Application ID',
      render: (row) => (
        <button
          type="button"
          className="text-left font-medium text-indigo-600 hover:text-indigo-700"
          onClick={() => onView(row.application_id)}
        >
          {row.application_id}
        </button>
      ),
    },
    {
      key: 'member_name',
      header: 'Member',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.member_name}</p>
          <p className="text-xs text-slate-400">{row.member_id}</p>
        </div>
      ),
    },
    {
      key: 'loan_type',
      header: 'Loan Type',
      render: (row) => (
        <span className="text-sm text-slate-700">{row.loan_type}</span>
      ),
    },
    {
      key: 'principal',
      header: 'Amount',
      render: (row) => (
        <span className="text-sm text-slate-700">
          {formatCurrency(row.principal)}
        </span>
      ),
    },
    {
      key: 'term_months',
      header: 'Term',
      render: (row) => (
        <span className="text-sm text-slate-700">{row.term_months} months</span>
      ),
    },
    {
      key: 'submitted_at',
      header: 'Submitted',
      render: (row) => (
        <span className="text-sm text-slate-500">
          {formatDate(row.submitted_at)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant="outline" className={getStatusClass(row.status)}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={result?.data ?? []}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage="No loan applications found."
      />

      {result && (
        <Pagination
          page={page}
          pages={result.pagination.pages}
          total={result.pagination.total}
          perPage={result.pagination.per_page}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
