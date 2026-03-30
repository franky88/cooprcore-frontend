'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemberLoans } from '@/hooks/member/useMemberPortal';
import { useMemberLoanApplications } from '@/hooks/useLoanApplications';
import { formatCurrency, formatDate } from '@/lib/formatters';

function getStatusClass(status: string) {
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
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

export default function MemberLoansClient() {
  const loansQuery = useMemberLoans();
  const applicationsQuery = useMemberLoanApplications();

  if (loansQuery.isLoading || applicationsQuery.isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading your loans...</div>
    );
  }

  if (loansQuery.isError || applicationsQuery.isError) {
    return (
      <div className="text-sm text-red-600">
        Unable to load your loan records.
      </div>
    );
  }

  const loans = loansQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];

  console.log('Member Loans:', loans);
  console.log('Member Loan Applications:', applications);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Loans</h1>
          <p className="text-sm text-muted-foreground">
            View your loan applications and approved loan records
          </p>
        </div>

        <Button asChild>
          <Link href="/member/loans/apply">Apply for Loan</Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Loan Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No loan applications submitted yet.
            </p>
          ) : (
            applications.map((application) => (
              <div key={application.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{application.loan_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.application_id}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                      application.status,
                    )}`}
                  >
                    {application.status}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p>Amount: {formatCurrency(application.principal)}</p>
                  <p>Term: {application.term_months} months</p>
                  <p>Submitted: {formatDate(application.submitted_at)}</p>
                  <p>Purpose: {application.purpose}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Approved / Existing Loans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No loan records found.
            </p>
          ) : (
            loans.map((loan) => (
              <div key={loan.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{loan.loan_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {loan.loan_id}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{loan.status}</span>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p>Principal: {formatCurrency(loan.principal)}</p>
                  <p>Outstanding: {formatCurrency(loan.outstanding_balance)}</p>

                  <p>
                    Monthly Amortization:{' '}
                    {loan.monthly_amortization
                      ? formatCurrency(loan.monthly_amortization)
                      : '—'}
                  </p>
                  <p>
                    Maturity Date:{' '}
                    {loan.maturity_date ? formatDate(loan.maturity_date) : '—'}
                  </p>
                  <p>Terms: {loan.term_months} months</p>
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
    </div>
  );
}
