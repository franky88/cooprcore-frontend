// frontend/components/savings/AccountTable.tsx
"use client";

import { useRouter } from "next/navigation";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import Pagination from "@/components/shared/Pagination";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { SavingsAccount } from "@/types/savings";
import type { PaginatedResponse } from "@/types/api";

const COLUMNS: Column<SavingsAccount>[] = [
  {
    key: "account_id",
    header: "Account ID",
    className: "w-36",
    render: (a) => (
      <span className="text-xs font-mono text-slate-500">{a.account_id}</span>
    ),
  },
  {
    key: "member",
    header: "Member",
    render: (a) => (
      <div>
        <p className="font-medium text-slate-900">{a.member_name}</p>
        <p className="text-xs font-mono text-slate-400">{a.member_id}</p>
      </div>
    ),
  },
  {
    key: "product",
    header: "Product / Rate",
    render: (a) => (
      <div>
        <p className="text-slate-700 font-medium">{a.product_type}</p>
        <p className="text-xs text-slate-400">{a.interest_rate}% p.a.</p>
      </div>
    ),
  },
  {
    key: "balance",
    header: "Balance",
    className: "text-right",
    render: (a) => (
      <p className="font-semibold text-slate-900 text-right">
        {formatCurrency(a.current_balance)}
      </p>
    ),
  },
  {
    key: "status",
    header: "Status",
    className: "w-24",
    render: (a) => <StatusBadge status={a.status} />,
  },
  {
    key: "date_opened",
    header: "Date Opened",
    className: "w-36",
    render: (a) => (
      <span className="text-xs text-slate-500">
        {formatDate(a.date_opened)}
      </span>
    ),
  },
];

interface AccountTableProps {
  result: PaginatedResponse<SavingsAccount> | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export default function AccountTable({
  result,
  isLoading,
  page,
  onPageChange,
}: AccountTableProps) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <DataTable
        columns={COLUMNS}
        data={result?.data ?? []}
        isLoading={isLoading}
        keyExtractor={(a) => a.id}
        onRowClick={(a) => router.push(`/savings/${a.account_id}`)}
        emptyMessage="No savings accounts found."
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