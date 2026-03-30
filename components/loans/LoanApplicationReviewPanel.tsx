'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  useApproveLoanApplication,
  useRejectLoanApplication,
  useReviewLoanApplication,
  useStaffLoanApplication,
} from '@/hooks/useLoanApplications';

interface LoanApplicationReviewPanelProps {
  applicationId: string;
}

export default function LoanApplicationReviewPanel({
  applicationId,
}: LoanApplicationReviewPanelProps) {
  const { data, isLoading, isError } = useStaffLoanApplication(applicationId);
  const reviewMutation = useReviewLoanApplication(applicationId);
  const approveMutation = useApproveLoanApplication(applicationId);
  const rejectMutation = useRejectLoanApplication(applicationId);

  const [reviewRemarks, setReviewRemarks] = useState('');
  const [approveRemarks, setApproveRemarks] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading application...</div>;
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-600">Unable to load application.</div>
    );
  }

  const canProcess =
    data.status === 'Submitted' || data.status === 'Under Review';

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Application Details</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Application ID" value={data.application_id} />
          <Field
            label="Member"
            value={`${data.member_name} (${data.member_id})`}
          />
          <Field label="Loan Type" value={data.loan_type} />
          <Field label="Principal" value={formatCurrency(data.principal)} />
          <Field label="Interest Rate" value={`${data.interest_rate}%`} />
          <Field label="Term" value={`${data.term_months} months`} />
          <Field
            label="Monthly Amortization"
            value={formatCurrency(data.monthly_amortization)}
          />
          <Field
            label="Total Payable"
            value={formatCurrency(data.total_payable)}
          />
          <Field
            label="Purpose"
            value={data.purpose}
            className="md:col-span-2"
          />
          <Field
            label="Co-makers"
            value={
              data.co_makers.length > 0
                ? data.co_makers
                    .map((co) => `${co.name} (${co.member_id})`)
                    .join(', ')
                : '—'
            }
            className="md:col-span-2"
          />
          <Field label="Submitted At" value={formatDate(data.submitted_at)} />
          <Field label="Status" value={data.status} />
          <Field
            label="Review Remarks"
            value={data.review_remarks || '—'}
            className="md:col-span-2"
          />
          <Field
            label="Rejected Reason"
            value={data.rejected_reason || '—'}
            className="md:col-span-2"
          />
          <Field
            label="Converted Loan ID"
            value={data.converted_loan_id || '—'}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Mark Under Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              placeholder="Optional review remarks"
              disabled={!canProcess || reviewMutation.isPending}
            />
            <Button
              className="w-full"
              disabled={!canProcess || reviewMutation.isPending}
              onClick={() => reviewMutation.mutate({ remarks: reviewRemarks })}
            >
              {reviewMutation.isPending ? 'Updating...' : 'Set Under Review'}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Approve Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={approveRemarks}
              onChange={(e) => setApproveRemarks(e.target.value)}
              placeholder="Optional approval remarks"
              disabled={!canProcess || approveMutation.isPending}
            />
            <Button
              className="w-full"
              disabled={!canProcess || approveMutation.isPending}
              onClick={() =>
                approveMutation.mutate({ remarks: approveRemarks })
              }
            >
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Reject Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection"
              disabled={!canProcess || rejectMutation.isPending}
            />
            <Input
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="Optional remarks"
              disabled={!canProcess || rejectMutation.isPending}
            />
            <Button
              variant="destructive"
              className="w-full"
              disabled={
                !canProcess || rejectMutation.isPending || !rejectReason.trim()
              }
              onClick={() =>
                rejectMutation.mutate({
                  rejected_reason: rejectReason,
                  remarks: rejectRemarks,
                })
              }
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
