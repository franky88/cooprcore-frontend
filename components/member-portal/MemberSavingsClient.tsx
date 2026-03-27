'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemberSavings } from '@/hooks/member/useMemberPortal';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function MemberSavingsClient() {
  const { data, isLoading, isError } = useMemberSavings();

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading your savings...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-600">Unable to load your savings.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Savings</h1>
        <p className="text-sm text-muted-foreground">
          View your savings accounts and balances
        </p>
      </div>

      <div className="grid gap-4">
        {data.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-8 text-sm text-muted-foreground">
              No savings accounts found.
            </CardContent>
          </Card>
        ) : (
          data.map((account) => (
            <Card key={account.id} className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      {account.product_type}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {account.account_id}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {account.status}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Current Balance"
                  value={formatCurrency(account.current_balance)}
                />
                <Field
                  label="Date Opened"
                  value={
                    account.date_opened ? formatDate(account.date_opened) : '—'
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
