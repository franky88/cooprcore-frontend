// frontend/components/reports/SavingsReport.tsx
"use client";

import { useState } from "react";
import { useSavingsReport } from "@/hooks/useReports";
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

const PRODUCT_COLORS = ["#6366f1", "#10b981", "#f59e0b"];
const STATUS_COLORS: Record<string, string> = {
  Active: "#10b981",
  Dormant: "#f59e0b",
  Closed: "#94a3b8",
};

export default function SavingsReport() {
  const [productType, setProductType] = useState<string>("");

  const { data, isLoading } = useSavingsReport({
    product_type: productType || undefined,
  });

  if (isLoading) return <ReportSkeleton />;
  if (!data) return null;

  const { total_accounts, total_deposits, summary_by_product, accounts } = data;

  // Build chart data from summary_by_product (Record)
  const productChartData = Object.entries(summary_by_product).map(
    ([product_type, val]) => ({
      product_type,
      total_balance: val.total_balance,
      count: val.count,
    })
  );

  // Build status counts from accounts array
  const statusCounts = accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const activeCount = statusCounts["Active"] ?? 0;
  const dormantCount = statusCounts["Dormant"] ?? 0;

  return (
    <div className="space-y-5">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ReportCard
          label="Total Accounts"
          value={total_accounts.toString()}
          accent="indigo"
        />
        <ReportCard
          label="Total Deposits"
          value={formatCurrency(total_deposits)}
          accent="indigo"
        />
        <ReportCard
          label="Active Accounts"
          value={activeCount.toString()}
          sub={`${dormantCount} dormant`}
          accent="green"
        />
        <ReportCard
          label="Product Types"
          value={Object.keys(summary_by_product).length.toString()}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Balance by Product Type
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {productChartData.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={productChartData} barSize={48}>
                  <XAxis
                    dataKey="product_type"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v === "Regular Savings"
                        ? "Regular"
                        : v === "Time Deposit"
                        ? "Time Dep."
                        : "Special"
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `₱${(v / 1000000).toFixed(1)}M`
                        : v >= 1000
                        ? `₱${(v / 1000).toFixed(0)}k`
                        : `₱${v}`
                    }
                  />
                  <Tooltip
                    formatter={(v) => [
                      formatCurrency(v as number),
                      "Total Balance",
                    ]}
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="total_balance" radius={[4, 4, 0, 0]}>
                    {productChartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PRODUCT_COLORS[i % PRODUCT_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Accounts by Status
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
                    dataKey="value"
                  >
                    {statusChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [v, "Accounts"]}
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
      </div>

      {/* ── Table ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Account Listing
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({accounts.length} records)
              </span>
            </CardTitle>
            <Select
              value={productType || "all"}
              onValueChange={(v) =>
                setProductType(v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="h-7 w-40 text-xs">
                <SelectValue placeholder="All products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                <SelectItem value="Regular Savings">Regular Savings</SelectItem>
                <SelectItem value="Time Deposit">Time Deposit</SelectItem>
                <SelectItem value="Special Savings">Special Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs">Account ID</TableHead>
                <TableHead className="text-xs">Member</TableHead>
                <TableHead className="text-xs">Product</TableHead>
                <TableHead className="text-xs text-right">Balance</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Last Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-xs text-slate-400 py-8"
                  >
                    No accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((a, i) => (
                  <TableRow key={a.account_id ?? i} className="text-xs">
                    <TableCell className="font-mono text-slate-500">
                      {a.account_id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {a.member_name}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {a.product_type}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {formatCurrency(a.current_balance)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {a.last_transaction_date
                        ? formatDate(a.last_transaction_date)
                        : "—"}
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