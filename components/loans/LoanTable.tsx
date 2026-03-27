// frontend/components/loans/LoanTable.tsx
"use client";

import { useRouter } from "next/navigation";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import Pagination from "@/components/shared/Pagination";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Loan } from "@/types/loan";
import type { PaginatedResponse } from "@/types/api";

const COLUMNS: Column<Loan>[] = [
  {
    key: "loan_id",
    header: "Loan ID",
    className: "w-36",
    render: (l) => (
      <span className="text-xs font-mono text-slate-500">{l.loan_id}</span>
    ),
  },
  {
    key: "member",
    header: "Member",
    render: (l) => (
      <div>
        <p className="font-medium text-slate-900">{l.member_name}</p>
        <p className="text-xs font-mono text-slate-400">{l.member_id}</p>
      </div>
    ),
  },
  {
    key: "loan_type",
    header: "Type / Principal",
    render: (l) => (
      <div>
        <p className="text-slate-700 font-medium">{l.loan_type}</p>
        <p className="text-xs text-slate-400">
          {formatCurrency(l.principal)} · {l.term_months} mos
        </p>
      </div>
    ),
  },
  {
    key: "outstanding_balance",
    header: "Outstanding",
    className: "text-right",
    render: (l) => (
      <div className="text-right">
        <p className="font-semibold text-slate-900">
          {formatCurrency(l.outstanding_balance)}
        </p>
        <p className="text-xs text-slate-400">
          of {formatCurrency(l.total_payable)}
        </p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    className: "w-28",
    render: (l) => <StatusBadge status={l.status} />,
  },
  {
    key: "maturity_date",
    header: "Maturity",
    className: "w-36",
    render: (l) => (
      <span className="text-xs text-slate-500">
        {l.maturity_date ? formatDate(l.maturity_date) : "—"}
      </span>
    ),
  },
];

interface LoanTableProps {
  result: PaginatedResponse<Loan> | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export default function LoanTable({
  result,
  isLoading,
  page,
  onPageChange,
}: LoanTableProps) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <DataTable
        columns={COLUMNS}
        data={result?.data ?? []}
        isLoading={isLoading}
        keyExtractor={(l) => l.id}
        onRowClick={(l) => router.push(`/loans/${l.loan_id}`)}
        emptyMessage="No loans found. Try adjusting your filters."
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