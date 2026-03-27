// frontend/app/(dashboard)/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useLoans } from "@/hooks/useLoans";
import { useMembers } from "@/hooks/useMembers";
import { useSavingsReport } from "@/hooks/useReports";
import { useLoansReport } from "@/hooks/useReports";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatFullName,
} from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/shared/StatusBadge";
import Link from "next/link";
import {
  Users,
  CreditCard,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { UserRole } from "@/types/auth";
import { useIsMounted } from "@/hooks/useIsMounted";

// ── Colors ────────────────────────────────────────────────────────────────────

const LOAN_STATUS_COLORS: Record<string, string> = {
  Pending:   "#3b82f6",
  Approved:  "#6366f1",
  Released:  "#8b5cf6",
  Current:   "#10b981",
  "Past Due": "#ef4444",
  Closed:    "#94a3b8",
  Rejected:  "#f87171",
};

const SAVINGS_COLORS = ["#6366f1", "#10b981", "#f59e0b"];

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconClass: string;
  href: string;
  alert?: boolean;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
  href,
  alert,
}: KpiCardProps) {
  return (
    <Link href={href}>
      <Card className="border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 truncate">
                {value}
              </p>
              {sub && (
                <p
                  className={`text-xs mt-1 ${
                    alert ? "text-red-500 font-medium" : "text-slate-400"
                  }`}
                >
                  {alert && (
                    <AlertTriangle className="inline h-3 w-3 mr-0.5 mb-0.5" />
                  )}
                  {sub}
                </p>
              )}
            </div>
            <div
              className={`flex items-center justify-center h-10 w-10 rounded-lg shrink-0 ${iconClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-[11px] text-slate-400 group-hover:text-indigo-500 transition-colors">
            <span>View details</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const mounted = useIsMounted();
  const role = session?.role as UserRole | undefined;

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: recentLoans, isLoading: loansLoading } = useLoans({
    page: 1,
    per_page: 5,
  });
  const { data: recentMembers, isLoading: membersLoading } = useMembers({
    page: 1,
    per_page: 5,
  });
  const { data: loansReport } = useLoansReport();
  const { data: savingsReport } = useSavingsReport();

  if (!mounted) return <DashboardSkeleton />;

  // ── Chart data ──
  const loanStatusData = loansReport
    ? Object.entries(loansReport.summary_by_status)
        .map(([status, val]) => ({ name: status, value: val.count }))
        .filter((d) => d.value > 0)
    : [];

  const savingsProductData = savingsReport
    ? Object.entries(savingsReport.summary_by_product).map(
        ([product_type, val]) => ({
          name:
            product_type === "Regular Savings"
              ? "Regular"
              : product_type === "Time Deposit"
              ? "Time Dep."
              : "Special",
          value: val.total_balance,
        })
      )
    : [];

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      {/* ── Greeting ── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 18
            ? "afternoon"
            : "evening"}
          , {firstName} 👋
        </h2>
        {summary && (
          <p className="text-xs text-slate-400 mt-0.5">
            Last updated {formatRelativeTime(summary.as_of)}
          </p>
        )}
      </div>

      {/* ── KPI Cards ── */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Members"
            value={summary.members.total.toString()}
            sub={`${summary.members.active} active`}
            icon={Users}
            iconClass="bg-indigo-50 text-indigo-600"
            href="/members"
          />
          <KpiCard
            label="Loan Portfolio"
            value={formatCurrency(summary.loans.total_outstanding)}
            sub={
              summary.loans.past_due > 0
                ? `${summary.loans.past_due} past due`
                : `${summary.loans.active} active loans`
            }
            icon={CreditCard}
            iconClass="bg-violet-50 text-violet-600"
            href="/loans"
            alert={summary.loans.past_due > 0}
          />
          <KpiCard
            label="Total Deposits"
            value={formatCurrency(summary.savings.total_deposits)}
            sub="Active savings accounts"
            icon={PiggyBank}
            iconClass="bg-emerald-50 text-emerald-600"
            href="/savings"
          />
          <KpiCard
            label="Share Capital"
            value={formatCurrency(summary.share_capital.total_paid_up)}
            sub="Total paid-up"
            icon={TrendingUp}
            iconClass="bg-amber-50 text-amber-600"
            href="/shares"
          />
        </div>
      ) : null}

      {/* ── Alert bar: pending approvals + past due ── */}
      {summary &&
        (summary.loans.pending_approval > 0 ||
          summary.loans.past_due > 0) && (
          <div className="flex items-center gap-4 flex-wrap">
            {summary.loans.pending_approval > 0 && (
              <Link href="/loans?status=Pending">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    {summary.loans.pending_approval} loan
                    {summary.loans.pending_approval > 1 ? "s" : ""} pending
                    approval
                  </span>
                  <ArrowRight className="h-3 w-3 text-blue-500" />
                </div>
              </Link>
            )}
            {summary.loans.past_due > 0 && (
              <Link href="/loans?status=Past+Due">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                  <span className="text-xs font-medium text-red-700">
                    {summary.loans.past_due} past due loan
                    {summary.loans.past_due > 1 ? "s" : ""}
                  </span>
                  <ArrowRight className="h-3 w-3 text-red-500" />
                </div>
              </Link>
            )}
          </div>
        )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Loan Portfolio by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loanStatusData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-xs text-slate-400">
                No loan data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={loanStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {loanStatusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={LOAN_STATUS_COLORS[entry.name] ?? "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [v, "Loans"]}
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
              Savings Balance by Product
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {savingsProductData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-xs text-slate-400">
                No savings data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={savingsProductData} barSize={48}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
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
                      "Balance",
                    ]}
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {savingsProductData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={SAVINGS_COLORS[i % SAVINGS_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent activity ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent loan applications */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                Recent Loans
              </CardTitle>
              <Link
                href="/loans"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {loansLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !recentLoans?.data.length ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No loans yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recentLoans.data.map((loan) => (
                  <Link
                    key={loan.id}
                    href={`/loans/${loan.loan_id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {loan.member_name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {loan.loan_id} · {loan.loan_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <p className="text-xs font-semibold text-slate-700">
                        {formatCurrency(loan.principal)}
                      </p>
                      <StatusBadge status={loan.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent members */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                Recent Members
              </CardTitle>
              <Link
                href="/members"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {membersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !recentMembers?.data.length ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No members yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recentMembers.data.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.member_id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {formatFullName(
                          member.first_name,
                          member.last_name,
                          member.middle_name
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {member.member_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <p className="text-[10px] text-slate-400">
                        {formatDate(member.date_admitted)}
                      </p>
                      <StatusBadge status={member.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}