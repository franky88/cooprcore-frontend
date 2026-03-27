// frontend/components/reports/MembersReport.tsx
"use client";

import { useState } from "react";
import { useMembersReport } from "@/hooks/useReports";
import ReportCard from "./ReportCard";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
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
import { formatDate } from "@/lib/formatters";

const STATUS_COLORS: Record<string, string> = {
  Active: "#10b981",
  Inactive: "#94a3b8",
  Suspended: "#f59e0b",
  Deceased: "#64748b",
};

export default function MembersReport() {
  const [status, setStatus] = useState<string>("");
  const [membershipType, setMembershipType] = useState<string>("");

  const { data, isLoading } = useMembersReport({
    status: status || undefined,
    membership_type: membershipType || undefined,
  });

  if (isLoading) return <ReportSkeleton />;
  if (!data) return null;

  const { total, status_counts, members } = data;

  // Build chart data from status_counts
  const statusChartData = Object.entries(status_counts)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const regular = members.filter(
    (m) => m.membership_type === "Regular"
  ).length;
  const associate = members.filter(
    (m) => m.membership_type === "Associate"
  ).length;

  const typeChartData = [
    { name: "Regular", value: regular },
    { name: "Associate", value: associate },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-5">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ReportCard
          label="Total Members"
          value={total.toString()}
          accent="indigo"
        />
        <ReportCard
          label="Active"
          value={(status_counts["Active"] ?? 0).toString()}
          sub={
            total > 0
              ? `${Math.round(((status_counts["Active"] ?? 0) / total) * 100)}% of total`
              : undefined
          }
          accent="green"
        />
        <ReportCard
          label="Inactive / Suspended"
          value={(
            (status_counts["Inactive"] ?? 0) +
            (status_counts["Suspended"] ?? 0)
          ).toString()}
          accent="amber"
        />
        <ReportCard
          label="Regular Members"
          value={regular.toString()}
          sub={`${associate} associate`}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Members by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {statusChartData.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">
                No data
              </p>
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
                    formatter={(value) => [value, "Members"]}
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
              Membership Type
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeChartData} barSize={56}>
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
                  formatter={(value) => [value, "Members"]}
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {typeChartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? "#6366f1" : "#a78bfa"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters + table ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Member Listing
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({members.length} records)
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={status || "all"}
                onValueChange={(v) => setStatus(v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-7 w-32 text-xs">
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
              <Select
                value={membershipType || "all"}
                onValueChange={(v) =>
                  setMembershipType(v === "all" ? "" : v)
                }
              >
                <SelectTrigger className="h-7 w-32 text-xs">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Associate">Associate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs">Member ID</TableHead>
                <TableHead className="text-xs">Full Name</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date Admitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-xs text-slate-400 py-8"
                  >
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m, i) => (
                  <TableRow key={m.member_id ?? i} className="text-xs">
                    <TableCell className="font-mono text-slate-500">
                      {m.member_id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {m.first_name} {m.last_name}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {m.membership_type}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={m.status} />
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatDate(m.date_admitted)}
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
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}