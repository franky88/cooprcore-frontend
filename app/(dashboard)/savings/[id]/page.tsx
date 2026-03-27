// frontend/app/(dashboard)/savings/[id]/page.tsx
'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  useSavingsAccount,
  useSavingsLedger,
  usePostTransaction,
  usePostInterest,
  useCloseAccount,
} from '@/hooks/useSavings';
import StatusBadge from '@/components/shared/StatusBadge';
import TransactionForm from '@/components/savings/TransactionForm';
import PostInterestModal from '@/components/savings/PostInterestModal';
import CloseAccountModal from '@/components/savings/CloseAccountModal';
import TransactionLedger from '@/components/savings/TransactionLedger';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import RoleGuard from '@/components/shared/RoleGuard';
import { useAddNotification } from '@/store/useStore';
import { extractApiError } from '@/lib/api';
import { formatCurrency, formatDate, formatPercent } from '@/lib/formatters';
import {
  ChevronLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Percent,
  XCircle,
  PiggyBank,
} from 'lucide-react';
import type {
  PostTransactionPayload,
  PostInterestPayload,
  CloseAccountPayload,
} from '@/types/savings';
import AccountStatement from '@/components/savings/AccountStatement';

type ActiveModal = 'deposit' | 'withdrawal' | 'interest' | 'close' | null;

interface Props {
  params: Promise<{ id: string }>;
}

export default function SavingsDetailPage({ params }: Props) {
  const { id } = use(params);
  const addNotification = useAddNotification();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const { data: account, isLoading, isError } = useSavingsAccount(id);
  const { data: transactions } = useSavingsLedger(id);

  const { mutateAsync: postTransaction } = usePostTransaction(id);
  const { mutateAsync: postInterest } = usePostInterest(id);
  const { mutateAsync: closeAccount } = useCloseAccount(id);

  if (isLoading) return <SavingsDetailSkeleton />;
  if (isError || !account) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">Account not found.</p>
        <Link
          href="/savings"
          className="text-xs text-indigo-600 hover:underline mt-1 block"
        >
          ← Back to Savings
        </Link>
      </div>
    );
  }

  const isActive = account.status === 'Active';

  const handleTransaction = async (payload: PostTransactionPayload) => {
    try {
      await postTransaction(payload);
      addNotification({
        type: 'success',
        title: `${payload.transaction_type} posted successfully`,
        message: `${formatCurrency(payload.amount)} ${
          payload.transaction_type === 'Deposit' ? 'credited' : 'debited'
        }.`,
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Transaction failed',
        message: extractApiError(e),
      });
      throw e;
    }
  };

  const handleInterest = async (payload: PostInterestPayload) => {
    try {
      await postInterest(payload);
      addNotification({
        type: 'success',
        title: 'Interest posted successfully',
        minRole: 'branch_manager',
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Interest posting failed',
        minRole: 'branch_manager',
        message: extractApiError(e),
      });
      throw e;
    }
  };

  const handleClose = async (payload: CloseAccountPayload) => {
    try {
      await closeAccount(payload);
      addNotification({
        type: 'success',
        title: 'Account closed',
        message: `${account.account_id} has been closed.`,
        minRole: 'branch_manager',
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Failed to close account',
        message: extractApiError(e),
        minRole: 'branch_manager',
      });
      throw e;
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2">
        <Link
          href="/savings"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Savings
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-mono font-medium">
          {account.account_id}
        </span>
      </div>

      {/* ── Header card ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-50 shrink-0">
                <PiggyBank className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {account.product_type}
                  </h2>
                  <StatusBadge status={account.status} />
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {account.account_id}
                </p>
                <Link
                  href={`/members/${account.member_id}`}
                  className="text-xs text-indigo-600 hover:underline mt-0.5 block"
                >
                  {account.member_name} ({account.member_id})
                </Link>
              </div>
            </div>

            {/* Balance + actions */}
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(account.current_balance)}
                </p>
                <p className="text-xs text-slate-400">
                  {formatPercent(account.interest_rate)} p.a.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-2">
            {isActive && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <RoleGuard
                  allowedRoles={['super_admin', 'branch_manager', 'cashier']}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setActiveModal('deposit')}
                  >
                    <ArrowDownCircle className="h-3.5 w-3.5" />
                    Deposit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => setActiveModal('withdrawal')}
                  >
                    <ArrowUpCircle className="h-3.5 w-3.5" />
                    Withdraw
                  </Button>
                </RoleGuard>

                <RoleGuard allowedRoles={['super_admin', 'branch_manager']}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={() => setActiveModal('interest')}
                  >
                    <Percent className="h-3.5 w-3.5" />
                    Post Interest
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setActiveModal('close')}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Close Account
                  </Button>
                </RoleGuard>
              </div>
            )}

            {/* Available to all roles */}
            <AccountStatement
              account={account}
              transactions={transactions ?? []}
            />
          </div>
        </CardFooter>
      </Card>

      {/* ── Account details ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2.5">
            <DetailRow label="Product Type" value={account.product_type} />
            <DetailRow
              label="Interest Rate"
              value={`${formatPercent(account.interest_rate)} p.a.`}
            />
            <DetailRow
              label="Date Opened"
              value={formatDate(account.date_opened)}
            />
            <DetailRow
              label="Last Transaction"
              value={formatDate(account.last_transaction_date)}
            />
            <DetailRow
              label="Last Interest Posting"
              value={formatDate(account.last_interest_posting)}
            />
            {account.passbook_number && (
              <DetailRow label="Passbook No." value={account.passbook_number} />
            )}
            {account.maturity_date && (
              <DetailRow
                label="Maturity Date"
                value={formatDate(account.maturity_date)}
              />
            )}
          </CardContent>
        </Card>

        {/* ── Balance summary ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Balance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex flex-col items-center justify-center h-full py-4 gap-2">
              <p className="text-xs text-slate-400">Current Balance</p>
              <p className="text-4xl font-bold text-indigo-700">
                {formatCurrency(account.current_balance)}
              </p>
              <p className="text-xs text-slate-400">
                Earning {formatPercent(account.interest_rate)} per annum
              </p>
              <p className="text-xs text-slate-400">
                ≈{' '}
                {formatCurrency(
                  (account.current_balance * account.interest_rate) / 100 / 12,
                )}{' '}
                gross/month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Transaction ledger ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Transaction Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <TransactionLedger transactions={transactions ?? []} />
        </CardContent>
      </Card>

      {/* ── Modals ── */}
      <TransactionForm
        open={activeModal === 'deposit'}
        type="Deposit"
        memberName={account.member_name}
        currentBalance={account.current_balance}
        onClose={() => setActiveModal(null)}
        onSubmit={handleTransaction}
      />

      <TransactionForm
        open={activeModal === 'withdrawal'}
        type="Withdrawal"
        memberName={account.member_name}
        currentBalance={account.current_balance}
        onClose={() => setActiveModal(null)}
        onSubmit={handleTransaction}
      />

      <PostInterestModal
        open={activeModal === 'interest'}
        memberName={account.member_name}
        currentBalance={account.current_balance}
        interestRate={account.interest_rate}
        onClose={() => setActiveModal(null)}
        onSubmit={handleInterest}
      />

      <CloseAccountModal
        open={activeModal === 'close'}
        memberName={account.member_name}
        accountId={account.account_id}
        currentBalance={account.current_balance}
        onClose={() => setActiveModal(null)}
        onSubmit={handleClose}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span className="text-xs text-slate-700 font-medium text-right">
        {value ?? <span className="text-slate-300">—</span>}
      </span>
    </div>
  );
}

function SavingsDetailSkeleton() {
  return (
    <div className="space-y-5 max-w-4xl">
      <Skeleton className="h-4 w-32" />
      <Card>
        <CardContent className="pt-5">
          <div className="flex justify-between gap-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-8 w-32 ml-auto" />
              <Skeleton className="h-3 w-20 ml-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
