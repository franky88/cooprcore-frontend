// frontend/components/reports/LoansReport.tsx
"use client";

import { useState } from "react";
import { useLoansReport } from "@/hooks/useReports";
import ReportCard from "./ReportCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { LOAN_STATUSES } from "@/lib/constants";

const STATUS_COLORS: Record<string, string> = {
  Pending: "#3b82f6",
  Approved: "#6366f1",
  Released: "#8b5cf6",
  Current: "#10b981",
  "Past Due": "#ef4444",
  Closed: "#94a3b8",
  Rejected: "#f87171",
};

const TYPE_COLORS = [
  "#6366f1", "#10b981", "#f59e0b",
  "#3b82f6", "#ec4899", "#14b8a6",
];

export default function LoansReport() {
  const [status, setStatus] = useState<string>("");

  const { data, isLoading } = useLoansReport({
    status: status || undefined,
  });

  if (isLoading) return <ReportSkeleton />;
  if (!data) return null;

  const { total_loans, total_portfolio_outstanding, summary_by_status, loans } = data;

  // Build chart data from summary_by_status (Record)
  const statusChartData = Object.entries(summary_by_status).map(
    ([status, val]) => ({ name: status, count: val.count })
  );

  // Build loan type data from loans array
  const byType = loans.reduce<Record<string, number>>((acc, l) => {
    acc[l.loan_type] = (acc[l.loan_type] ?? 0) + l.outstanding_balance;
    return acc;
  }, {});

  const typeChartData = Object.entries(byType).map(([loan_type, total]) => ({
    loan_type,
    total_outstanding: Math.round(total * 100) / 100,
  }));

  const pastDueCount = summary_by_status["Past Due"]?.count ?? 0;
  const currentCount = summary_by_status["Current"]?.count ?? 0;
  const pendingCount = summary_by_status["Pending"]?.count ?? 0;

  return (
    <div className="space-y-5">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ReportCard
          label="Total Loans"
          value={total_loans.toString()}
          accent="indigo"
        />
        <ReportCard
          label="Portfolio Outstanding"
          value={formatCurrency(total_portfolio_outstanding)}
          accent="indigo"
        />
        <ReportCard
          label="Past Due"
          value={pastDueCount.toString()}
          sub={`${currentCount} current · ${pendingCount} pending`}
          accent={pastDueCount > 0 ? "red" : "green"}
        />
        <ReportCard
          label="Total Principal"
          value={formatCurrency(
            Object.values(summary_by_status).reduce(
              (s, v) => s + v.total_principal, 0
            )
          )}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Loans by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {statusChartData.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {statusChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Outstanding by Loan Type
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {typeChartData.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={typeChartData}
                  layout="vertical"
                  barSize={14}
                  margin={{ left: 16 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="loan_type"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(v) => [
                      formatCurrency(v as number),
                      "Outstanding",
                    ]}
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="total_outstanding" radius={[0, 4, 4, 0]}>
                    {typeChartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={TYPE_COLORS[i % TYPE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Table ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Loan Listing
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({loans.length} records)
              </span>
            </CardTitle>
            <Select
              value={status || "all"}
              onValueChange={(v) => setStatus(v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-7 w-36 text-xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LOAN_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs">Loan ID</TableHead>
                <TableHead className="text-xs">Member</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs text-right">Principal</TableHead>
                <TableHead className="text-xs text-right">Outstanding</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Maturity</TableHead>
                <TableHead className="text-xs text-right">Days Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-xs text-slate-400 py-8"
                  >
                    No loans found.
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((l, i) => (
                  <TableRow key={l.loan_id ?? i} className="text-xs">
                    <TableCell className="font-mono text-slate-500">
                      {l.loan_id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {l.member_name}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {l.loan_type}
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      {formatCurrency(l.principal)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {formatCurrency(l.outstanding_balance)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={l.status} />
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {l.maturity_date ? formatDate(l.maturity_date) : "—"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        l.days_overdue > 0 ? "text-red-600" : "text-slate-400"
                      )}
                    >
                      {l.days_overdue > 0 ? `${l.days_overdue}d` : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}