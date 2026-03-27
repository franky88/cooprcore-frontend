// frontend/app/(dashboard)/shares/[id]/page.tsx
"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  useShare,
  useSharePayments,
  useUpdateSubscription,
  usePostSharePayment,
} from "@/hooks/useShares";
import ShareLedger from "@/components/shares/ShareLedger";
import PaymentForm from "@/components/shares/PaymentForm";
import SubscribeModal from "@/components/shares/SubscribeModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import RoleGuard from "@/components/shared/RoleGuard";
import { useAddNotification } from "@/store/useStore";
import { extractApiError } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  formatPercent,
} from "@/lib/formatters";
import { SHARE_PAR_VALUE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  TrendingUp,
  Receipt,
  PlusCircle,
} from "lucide-react";
import type {
  UpdateSubscriptionPayload,
  PostSharePaymentPayload,
} from "@/types/share";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ShareDetailPage({ params }: Props) {
  const { id } = use(params);
  const addNotification = useAddNotification();

  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState<boolean>(false);

  const { data: share, isLoading, isError } = useShare(id);
  const { data: payments } = useSharePayments(id);

  console.log("payments", payments)

  const { mutateAsync: updateSubscription } = useUpdateSubscription(id);
  const { mutateAsync: postPayment } = usePostSharePayment(id);

  if (isLoading) return <ShareDetailSkeleton />;
  if (isError || !share) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">Share record not found.</p>
        <Link
          href="/shares"
          className="text-xs text-indigo-600 hover:underline mt-1 block"
        >
          ← Back to Share Capital
        </Link>
      </div>
    );
  }

  const isFullyPaid = share.outstanding_amount <= 0;

  const handleUpdateSubscription = async (
    payload: UpdateSubscriptionPayload
  ) => {
    try {
      await updateSubscription(payload);
      addNotification({
        type: "success",
        title: "Subscription updated",
        message: `Added ${payload.additional_shares} shares.`,
      });
    } catch (e) {
      addNotification({
        type: "error",
        title: "Update failed",
        message: extractApiError(e),
      });
      throw e;
    }
  };

  const handlePostPayment = async (payload: PostSharePaymentPayload) => {
    try {
      await postPayment(payload);
      addNotification({
        type: "success",
        title: "Payment recorded",
        message: `${formatCurrency(payload.amount_paid)} paid.`,
      });
    } catch (e) {
      addNotification({
        type: "error",
        title: "Payment failed",
        message: extractApiError(e),
      });
      throw e;
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2">
        <Link
          href="/shares"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Share Capital
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-mono font-medium">
          {share.share_id}
        </span>
      </div>

      {/* ── Header card ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-50 shrink-0">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Share Capital
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {share.share_id}
                </p>
                <Link
                  href={`/members/${share.member_id}`}
                  className="text-xs text-indigo-600 hover:underline mt-0.5 block"
                >
                  {share.member_name} ({share.member_id})
                </Link>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <RoleGuard
                allowedRoles={["super_admin", "branch_manager", "loan_officer"]}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  onClick={() => setShowSubscribeModal(true)}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Update Subscription
                </Button>
              </RoleGuard>

              <RoleGuard
                allowedRoles={["super_admin", "branch_manager", "cashier"]}
              >
                <Button
                  size="sm"
                  className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                  disabled={isFullyPaid || share.subscribed_shares === 0}
                  onClick={() => setShowPaymentModal(true)}
                >
                  <Receipt className="h-3.5 w-3.5" />
                  Record Payment
                </Button>
              </RoleGuard>
            </div>
          </div>

          {/* ── Progress bar ── */}
          {share.subscribed_shares > 0 && (
            <div className="mt-5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {share.paid_shares} of {share.subscribed_shares} shares paid
                </span>
                <span
                  className={cn(
                    "font-semibold",
                    isFullyPaid ? "text-emerald-600" : "text-indigo-600"
                  )}
                >
                  {formatPercent(share.percentage_paid)}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isFullyPaid ? "bg-emerald-500" : "bg-indigo-500"
                  )}
                  style={{
                    width: `${Math.min(share.percentage_paid, 100)}%`,
                  }}
                />
              </div>
              {isFullyPaid && (
                <p className="text-xs text-emerald-600 font-medium">
                  ✓ Fully paid-up
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Details grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subscription details */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2.5">
            <DetailRow
              label="Par Value"
              value={`₱${SHARE_PAR_VALUE} per share`}
            />
            <DetailRow
              label="Subscribed Shares"
              value={`${share.subscribed_shares} shares`}
            />
            <DetailRow
              label="Subscribed Amount"
              value={formatCurrency(share.subscribed_amount)}
            />
            <DetailRow
              label="Date Subscribed"
              value={formatDate(share.date_subscribed)}
            />
          </CardContent>
        </Card>

        {/* Payment summary */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2.5">
            <DetailRow
              label="Paid Shares"
              value={`${share.paid_shares} shares`}
            />
            <DetailRow
              label="Paid Amount"
              value={formatCurrency(share.paid_amount)}
              highlight
            />
            <DetailRow
              label="Outstanding Shares"
              value={`${share.subscribed_shares - share.paid_shares} shares`}
            />
            <DetailRow
              label="Outstanding Amount"
              value={formatCurrency(share.outstanding_amount)}
              warn={share.outstanding_amount > 0}
            />
            <DetailRow
              label="Last Payment"
              value={formatDate(share.last_payment_date)}
            />
          </CardContent>
        </Card>

        {/* Payment ledger */}
        <Card className="border-slate-200 shadow-sm md:col-span-2">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Receipt className="h-3.5 w-3.5 text-slate-400" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ShareLedger payments={payments ?? []} />
          </CardContent>
        </Card>
      </div>

      {/* ── Modals ── */}
      <PaymentForm
        open={showPaymentModal}
        memberName={share.member_name}
        shareId={id}
        outstandingAmount={share.outstanding_amount}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePostPayment}
      />

      <SubscribeModal
        open={showSubscribeModal}
        memberName={share.member_name}
        currentSubscribedShares={share.subscribed_shares}
        onClose={() => setShowSubscribeModal(false)}
        onSubmit={handleUpdateSubscription}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value?: string | null;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span
        className={cn(
          "text-xs text-right font-medium",
          highlight && "text-indigo-700 font-semibold",
          warn && "text-amber-600 font-semibold",
          !highlight && !warn && "text-slate-700"
        )}
      >
        {value ?? <span className="text-slate-300">—</span>}
      </span>
    </div>
  );
}

function ShareDetailSkeleton() {
  return (
    <div className="space-y-5 max-w-4xl">
      <Skeleton className="h-4 w-32" />
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-56 rounded-xl col-span-2" />
      </div>
    </div>
  );
}