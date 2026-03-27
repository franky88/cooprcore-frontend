'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemberLoans } from '@/hooks/member/useMemberPortal';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function MemberLoansClient() {
  const { data, isLoading, isError } = useMemberLoans();

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading your loans...</div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-600">Unable to load your loans.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Loans</h1>
        <p className="text-sm text-muted-foreground">
          View your loan applications and balances
        </p>
      </div>

      <div className="grid gap-4">
        {data.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-8 text-sm text-muted-foreground">
              No loan records found.
            </CardContent>
          </Card>
        ) : (
          data.map((loan) => (
            <Card key={loan.id} className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      {loan.loan_type}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {loan.loan_id}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {loan.status}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Field
                  label="Principal"
                  value={formatCurrency(loan.principal)}
                />
                <Field
                  label="Outstanding Balance"
                  value={formatCurrency(loan.outstanding_balance)}
                />
                <Field
                  label="Monthly Amortization"
                  value={
                    loan.monthly_amortization
                      ? formatCurrency(loan.monthly_amortization)
                      : '—'
                  }
                />
                <Field
                  label="Interest Rate"
                  value={
                    typeof loan.interest_rate === 'number'
                      ? `${loan.interest_rate}%`
                      : '—'
                  }
                />
                <Field
                  label="Term"
                  value={
                    typeof loan.term_months === 'number'
                      ? `${loan.term_months} months`
                      : '—'
                  }
                />
                <Field
                  label="Date Applied"
                  value={
                    loan.date_applied ? formatDate(loan.date_applied) : '—'
                  }
                />
                <Field
                  label="Date Released"
                  value={
                    loan.date_released ? formatDate(loan.date_released) : '—'
                  }
                />
                <Field
                  label="Maturity Date"
                  value={
                    loan.maturity_date ? formatDate(loan.maturity_date) : '—'
                  }
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
