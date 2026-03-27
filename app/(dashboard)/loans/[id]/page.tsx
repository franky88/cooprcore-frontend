// frontend/app/(dashboard)/loans/[id]/page.tsx
'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  useLoan,
  useLoanPayments,
  useApproveLoan,
  useRejectLoan,
  useReleaseLoan,
  usePostPayment,
} from '@/hooks/useLoans';
import StatusBadge from '@/components/shared/StatusBadge';
import ApprovalModal from '@/components/loans/ApprovalModal';
import PostPaymentModal from '@/components/loans/PostPaymentModal';
import LoanCalculator from '@/components/loans/LoanCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import RoleGuard from '@/components/shared/RoleGuard';
import { useAddNotification } from '@/store/useStore';
import { extractApiError } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  computeLoanProgress,
} from '@/lib/formatters';
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Banknote,
  Receipt,
  CalendarClock,
} from 'lucide-react';

type ModalAction = 'approve' | 'reject' | 'release';

interface Props {
  params: Promise<{ id: string }>;
}

export default function LoanDetailPage({ params }: Props) {
  const { id } = use(params);
  const addNotification = useAddNotification();

  const { data: loan, isLoading, isError } = useLoan(id);
  const { data: payments } = useLoanPayments(id);

  const [activeModal, setActiveModal] = useState<ModalAction | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const { mutateAsync: approve } = useApproveLoan(id);
  const { mutateAsync: reject } = useRejectLoan(id);
  const { mutateAsync: release } = useReleaseLoan(id);
  const { mutateAsync: postPayment } = usePostPayment(id);

  if (isLoading) return <LoanDetailSkeleton />;
  if (isError || !loan) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">Loan not found.</p>
        <Link
          href="/loans"
          className="text-xs text-indigo-600 hover:underline mt-1 block"
        >
          ← Back to Loans
        </Link>
      </div>
    );
  }

  const progress = computeLoanProgress(loan.payments_made, loan.term_months);

  // Which action buttons to show based on status
  const canApprove = loan.status === 'Pending';
  const canRelease = loan.status === 'Approved';
  const canPostPayment =
    loan.status === 'Current' || loan.status === 'Past Due';

  const handleApprove = async () => {
    try {
      await approve();
      addNotification({
        type: 'success',
        title: 'Loan approved successfully',
        minRole: 'loan_officer',
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: extractApiError(e),
        minRole: 'loan_officer',
      });
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await reject({ reason: reason });
      addNotification({
        type: 'success',
        title: 'Loan rejected',
        minRole: 'loan_officer',
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: extractApiError(e),
        minRole: 'loan_officer',
      });
    }
  };

  const handleRelease = async (orNumber: string, date: string) => {
    try {
      await release({ or_number: orNumber, release_date: date });
      addNotification({
        type: 'success',
        title: 'Loan funds released successfully',
        minRole: 'cashier',
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: extractApiError(e),
        minRole: 'cashier',
      });
    }
  };

  const handlePostPayment = async (
    payload: Parameters<typeof postPayment>[0],
  ) => {
    try {
      await postPayment(payload);
      addNotification({
        type: 'success',
        title: 'Payment posted successfully',
      });
    } catch (e) {
      addNotification({ type: 'error', title: extractApiError(e) });
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2">
        <Link
          href="/loans"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Loans
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-mono font-medium">
          {loan.loan_id}
        </span>
      </div>

      {/* ── Header card ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {loan.loan_type} Loan
                </h2>
                <StatusBadge status={loan.status} />
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {loan.loan_id}
              </p>
              <Link
                href={`/members/${loan.member_id}`}
                className="text-xs text-indigo-600 hover:underline mt-1 block"
              >
                {loan.member_name} ({loan.member_id})
              </Link>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <RoleGuard allowedRoles={['super_admin', 'branch_manager']}>
                {canApprove && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setActiveModal('reject')}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setActiveModal('approve')}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                  </>
                )}
                {canRelease && (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setActiveModal('release')}
                  >
                    <Banknote className="h-3.5 w-3.5" />
                    Release Funds
                  </Button>
                )}
              </RoleGuard>

              <RoleGuard
                allowedRoles={['super_admin', 'branch_manager', 'cashier']}
              >
                {canPostPayment && (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    Post Payment
                  </Button>
                )}
              </RoleGuard>
            </div>
          </div>

          {/* ── Progress bar (for active loans) ── */}
          {(loan.status === 'Current' || loan.status === 'Past Due') && (
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {loan.payments_made} of {loan.term_months} payments
                </span>
                <span>{progress}% paid</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Loan terms ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Loan Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2.5">
            <DetailRow
              label="Principal"
              value={formatCurrency(loan.principal)}
            />
            <DetailRow
              label="Interest Rate"
              value={`${loan.interest_rate}% p.a.`}
            />
            <DetailRow label="Term" value={`${loan.term_months} months`} />
            <DetailRow
              label="Monthly Amortization"
              value={formatCurrency(loan.monthly_amortization)}
            />
            <DetailRow
              label="Total Payable"
              value={formatCurrency(loan.total_payable)}
            />
            <DetailRow
              label="Total Interest"
              value={formatCurrency(loan.total_interest)}
            />
            <DetailRow label="Purpose" value={loan.purpose} />
          </CardContent>
        </Card>

        {/* ── Balances & dates ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
              Balance & Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2.5">
            <DetailRow
              label="Outstanding Balance"
              value={formatCurrency(loan.outstanding_balance)}
              highlight
            />
            <DetailRow
              label="Total Paid"
              value={formatCurrency(loan.total_paid)}
            />
            <DetailRow
              label="Date Applied"
              value={formatDate(loan.date_applied)}
            />
            <DetailRow
              label="Next Due Date"
              value={formatDate(loan.next_due_date)}
            />
            {loan.date_approved && (
              <DetailRow
                label="Date Approved"
                value={formatDate(loan.date_approved)}
              />
            )}
            {loan.date_released && (
              <DetailRow
                label="Date Released"
                value={formatDate(loan.date_released)}
              />
            )}
            {loan.maturity_date && (
              <DetailRow
                label="Maturity Date"
                value={formatDate(loan.maturity_date)}
              />
            )}
            {loan.rejected_reason && (
              <DetailRow
                label="Rejection Reason"
                value={loan.rejected_reason}
              />
            )}
          </CardContent>
        </Card>

        {/* ── Payment history ── */}
        <Card className="border-slate-200 shadow-sm md:col-span-2">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Receipt className="h-3.5 w-3.5 text-slate-400" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {!payments || payments.length === 0 ? (
              <p className="text-xs text-slate-400 px-5 pb-5">
                No payments recorded yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">OR Number</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs text-right">
                      Principal
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Interest
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Penalty
                    </TableHead>
                    <TableHead className="text-xs text-right">Excess</TableHead>
                    <TableHead className="text-xs text-right">
                      Balance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...payments]
                    .sort(
                      (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime(),
                    )
                    .map((p) => (
                      <TableRow key={p.payment_id} className="text-xs">
                        <TableCell className="text-slate-500">
                          {formatShortDate(p.payment_date)}
                        </TableCell>
                        <TableCell className="font-mono text-slate-500">
                          {p.or_number}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(p.amount_paid)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          {formatCurrency(p.principal_portion)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          {formatCurrency(p.interest_portion)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          {formatCurrency(p.penalty_portion)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          {formatCurrency(p.excess ?? 0)}
                        </TableCell>
                        <TableCell className="text-right text-slate-700 font-medium">
                          {formatCurrency(p.balance_after)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ── Amortization schedule ── */}
        <Card className="border-slate-200 shadow-sm md:col-span-2">
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Amortization Schedule
              </CardTitle>
              <button
                onClick={() => setShowSchedule((v) => !v)}
                className="text-xs text-indigo-600 hover:underline"
              >
                {showSchedule ? 'Hide' : 'Show schedule'}
              </button>
            </div>
          </CardHeader>
          {showSchedule && (
            <CardContent className="px-5 pb-5">
              <LoanCalculator
                value={{
                  loanType: loan.loan_type,
                  principal: loan.principal,
                  rate: loan.interest_rate,
                  term: loan.term_months,
                }}
                showSchedule={true}
              />
            </CardContent>
          )}
        </Card>
      </div>

      {/* ── Modals ── */}
      <ApprovalModal
        action={activeModal}
        loanId={id}
        memberName={loan.member_name}
        onClose={() => setActiveModal(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onRelease={handleRelease}
      />

      <PostPaymentModal
        open={showPaymentModal}
        loanId={id}
        memberName={loan.member_name}
        monthlyAmortization={loan.monthly_amortization}
        outstandingBalance={loan.outstanding_balance}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePostPayment}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span
        className={`text-xs text-right font-medium ${
          highlight ? 'text-indigo-700 font-semibold' : 'text-slate-700'
        }`}
      >
        {value ?? <span className="text-slate-300">—</span>}
      </span>
    </div>
  );
}

function LoanDetailSkeleton() {
  return (
    <div className="space-y-5 max-w-4xl">
      <Skeleton className="h-4 w-32" />
      <Card>
        <CardContent className="pt-5 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-full mt-4" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
