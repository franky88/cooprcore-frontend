// frontend/components/shares/ShareTable.tsx
"use client";

import { useRouter } from "next/navigation";
import DataTable, { type Column } from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import { formatCurrency, formatPercent, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ShareCapital } from "@/types/share";
import type { PaginatedResponse } from "@/types/api";

const COLUMNS: Column<ShareCapital>[] = [
  {
    key: "share_id",
    header: "Share ID",
    className: "w-36",
    render: (s) => (
      <span className="text-xs font-mono text-slate-500">{s.share_id}</span>
    ),
  },
  {
    key: "member",
    header: "Member",
    render: (s) => (
      <div>
        <p className="font-medium text-slate-900">{s.member_name}</p>
        <p className="text-xs font-mono text-slate-400">{s.member_id}</p>
      </div>
    ),
  },
  {
    key: "shares",
    header: "Subscribed / Paid",
    render: (s) => (
      <div>
        <p className="text-slate-700 font-medium">
          {s.paid_shares}{" "}
          <span className="text-slate-400 font-normal">
            / {s.subscribed_shares} shares
          </span>
        </p>
        <p className="text-xs text-slate-400">
          {formatCurrency(s.paid_amount)} /{" "}
          {formatCurrency(s.subscribed_amount)}
        </p>
      </div>
    ),
  },
  {
    key: "outstanding",
    header: "Outstanding",
    className: "text-right",
    render: (s) => (
      <p
        className={cn(
          "text-right font-semibold",
          s.outstanding_amount > 0 ? "text-amber-600" : "text-emerald-600"
        )}
      >
        {formatCurrency(s.outstanding_amount)}
      </p>
    ),
  },
  {
    key: "percentage",
    header: "% Paid",
    className: "w-32",
    render: (s) => (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {formatPercent(s.percentage_paid)}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
          <div
            className={cn(
              "h-full rounded-full",
              s.percentage_paid >= 100
                ? "bg-emerald-500"
                : s.percentage_paid >= 50
                ? "bg-indigo-500"
                : "bg-amber-400"
            )}
            style={{ width: `${Math.min(s.percentage_paid, 100)}%` }}
          />
        </div>
      </div>
    ),
  },
  {
    key: "date_subscribed",
    header: "Date Subscribed",
    className: "w-36",
    render: (s) => (
      <span className="text-xs text-slate-500">
        {formatDate(s.date_subscribed)}
      </span>
    ),
  },
];

interface ShareTableProps {
  result: PaginatedResponse<ShareCapital> | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export default function ShareTable({
  result,
  isLoading,
  page,
  onPageChange,
}: ShareTableProps) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <DataTable
        columns={COLUMNS}
        data={result?.data ?? []}
        isLoading={isLoading}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => router.push(`/shares/${s.share_id}`)}
        emptyMessage="No share capital records found."
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