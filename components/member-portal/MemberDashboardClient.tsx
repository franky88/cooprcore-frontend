'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemberDashboard } from '@/hooks/member/useMemberPortal';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Wallet, Landmark, PieChart, CreditCard } from 'lucide-react';

export default function MemberDashboardClient() {
  const { data, isLoading, isError } = useMemberDashboard();

  if (isLoading) {
    return (
      <div className="text-sm text-slate-500">Loading member dashboard...</div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-600">Unable to load your dashboard.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Welcome, {data.member.first_name}
        </h2>
        <p className="text-sm text-slate-400">
          Here is a summary of your cooperative account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Savings"
          value={formatCurrency(data.stats.total_savings_balance)}
          icon={<Landmark className="h-4 w-4 text-indigo-600" />}
        />
        <StatCard
          title="Active Loans"
          value={String(data.stats.active_loans_count)}
          icon={<CreditCard className="h-4 w-4 text-indigo-600" />}
        />
        <StatCard
          title="Loan Balance"
          value={formatCurrency(data.stats.total_loan_balance)}
          icon={<Wallet className="h-4 w-4 text-indigo-600" />}
        />
        <StatCard
          title="Paid-up Shares"
          value={formatCurrency(data.stats.share_paid_amount)}
          icon={<PieChart className="h-4 w-4 text-indigo-600" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Loans</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.loans.length === 0 ? (
              <p className="text-sm text-slate-500">No loan records yet.</p>
            ) : (
              data.loans.slice(0, 5).map((loan) => (
                <div
                  key={loan.loan_id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {loan.loan_type}
                      </p>
                      <p className="text-xs text-slate-400">{loan.loan_id}</p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                      {loan.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-1 text-sm text-slate-500">
                    <p>Principal: {formatCurrency(loan.principal)}</p>
                    <p>
                      Outstanding: {formatCurrency(loan.outstanding_balance)}
                    </p>
                    <p>
                      Applied:{' '}
                      {loan.date_applied ? formatDate(loan.date_applied) : '—'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Savings Accounts</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.savings.length === 0 ? (
              <p className="text-sm text-slate-500">
                No savings accounts found.
              </p>
            ) : (
              data.savings.map((account) => (
                <div
                  key={account.account_id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {account.product_type}
                      </p>
                      <p className="text-xs text-slate-400">
                        {account.account_id}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                      {account.status}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-500">
                    Balance: {formatCurrency(account.current_balance)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
        <div className="rounded-lg bg-indigo-50 p-2">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}
