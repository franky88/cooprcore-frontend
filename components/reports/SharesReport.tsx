// frontend/components/reports/SharesReport.tsx
"use client";

import { useSharesReport } from "@/hooks/useReports";
import ReportCard from "./ReportCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export default function SharesReport() {
  const { data, isLoading } = useSharesReport();

  if (isLoading) return <ReportSkeleton />;
  if (!data) return null;

  const {
    total_members,
    members_with_paid_shares,
    total_subscribed_amount,
    total_paid_amount,
    total_outstanding_amount,
    records,
  } = data;

  const paymentData = [
    { name: "Paid", value: total_paid_amount, fill: "#10b981" },
    { name: "Outstanding", value: total_outstanding_amount, fill: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const fullyPaid = records.filter((r) => r.percentage_paid >= 100).length;
  const partiallyPaid = records.filter(
    (r) => r.percentage_paid > 0 && r.percentage_paid < 100
  ).length;
  const unpaid = records.filter((r) => r.percentage_paid === 0).length;

  const distributionData = [
    { name: "Fully Paid", value: fullyPaid, fill: "#10b981" },
    { name: "Partial", value: partiallyPaid, fill: "#6366f1" },
    { name: "Unpaid", value: unpaid, fill: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const avgPct =
    records.length > 0
      ? records.reduce((s, r) => s + r.percentage_paid, 0) / records.length
      : 0;

  return (
    <div className="space-y-5">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ReportCard
          label="Total Members"
          value={total_members.toString()}
          accent="indigo"
        />
        <ReportCard
          label="Total Paid-Up"
          value={formatCurrency(total_paid_amount)}
          sub={`of ${formatCurrency(total_subscribed_amount)} subscribed`}
          accent="green"
        />
        <ReportCard
          label="Outstanding"
          value={formatCurrency(total_outstanding_amount)}
          accent={total_outstanding_amount > 0 ? "amber" : "default"}
        />
        <ReportCard
          label="Avg. % Paid"
          value={formatPercent(avgPct)}
          sub={`${members_with_paid_shares} with paid shares`}
          accent={avgPct >= 80 ? "green" : avgPct >= 50 ? "indigo" : "amber"}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Paid vs Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {paymentData.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [formatCurrency(v as number)]}
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
              Payment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {distributionData.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={distributionData} barSize={56}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [v, "Members"]}
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {distributionData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Records table ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Share Capital Records
            <span className="ml-2 text-xs font-normal text-slate-400">
              ({records.length} records)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs">Share ID</TableHead>
                <TableHead className="text-xs">Member</TableHead>
                <TableHead className="text-xs text-right">Subscribed</TableHead>
                <TableHead className="text-xs text-right">Paid</TableHead>
                <TableHead className="text-xs text-right">Outstanding</TableHead>
                <TableHead className="text-xs w-40">% Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-xs text-slate-400 py-8"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r, i) => (
                  <TableRow key={r.share_id ?? i} className="text-xs">
                    <TableCell className="font-mono text-slate-500">
                      {r.share_id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {r.member_name}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {r.subscribed_shares} shares
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {formatCurrency(r.paid_amount)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        r.outstanding_amount > 0
                          ? "text-amber-600"
                          : "text-slate-400"
                      )}
                    >
                      {formatCurrency(r.outstanding_amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              r.percentage_paid >= 100
                                ? "bg-emerald-500"
                                : r.percentage_paid >= 50
                                ? "bg-indigo-500"
                                : "bg-amber-400"
                            )}
                            style={{
                              width: `${Math.min(r.percentage_paid, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 w-10 text-right shrink-0">
                          {formatPercent(r.percentage_paid, 0)}
                        </span>
                      </div>
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