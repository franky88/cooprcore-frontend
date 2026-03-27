'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemberShares } from '@/hooks/member/useMemberPortal';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function MemberSharesClient() {
  const { data, isLoading, isError } = useMemberShares();

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading your share capital...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-red-600">
        Unable to load your share capital.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Shares</h1>
        <p className="text-sm text-muted-foreground">
          View your share capital status
        </p>
      </div>

      {!data ? (
        <Card className="rounded-2xl">
          <CardContent className="py-8 text-sm text-muted-foreground">
            No share capital record found.
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Share Capital Details</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Share ID" value={data.share_id} />
            <Field
              label="Subscribed Shares"
              value={String(data.subscribed_shares)}
            />
            <Field label="Paid Shares" value={String(data.paid_shares)} />
            <Field
              label="Par Value"
              value={formatCurrency(data.share_par_value)}
            />
            <Field
              label="Subscribed Amount"
              value={formatCurrency(data.subscribed_amount)}
            />
            <Field
              label="Paid Amount"
              value={formatCurrency(data.paid_amount)}
            />
            <Field
              label="Outstanding Amount"
              value={formatCurrency(data.outstanding_amount)}
            />
            <Field label="Percentage Paid" value={`${data.percentage_paid}%`} />
            <Field
              label="Last Payment Date"
              value={
                data.last_payment_date
                  ? formatDate(data.last_payment_date)
                  : '—'
              }
            />
          </CardContent>
        </Card>
      )}
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
