// frontend/app/(dashboard)/members/[id]/page.tsx
'use client';

import { use } from 'react';
import Link from 'next/link';
import { useMemberSummary } from '@/hooks/useMembers';
import StatusBadge from '@/components/shared/StatusBadge';
import {
  formatFullName,
  formatDate,
  formatCurrency,
  formatPercent,
  getInitials,
} from '@/lib/formatters';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Pencil,
  Edit2,
  Edit,
} from 'lucide-react';
import { SHARE_PAR_VALUE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import RoleGuard from '@/components/shared/RoleGuard';
import DeactivateMemberButton from '@/components/members/DeactivateMemberButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default function MemberDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data, isLoading, isError } = useMemberSummary(id);

  if (isLoading) return <MemberDetailSkeleton />;

  if (isError || !data) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">Member not found or failed to load.</p>
        <Link
          href="/members"
          className="text-xs text-indigo-600 hover:underline mt-1 block"
        >
          ← Back to Members
        </Link>
      </div>
    );
  }

  const { member, loans, savings, shares } = data;
  const fullName = formatFullName(
    member.first_name,
    member.last_name,
    member.middle_name,
  );

  console.log('Shares', shares);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2">
        <Link
          href="/members"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Members
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-medium">{fullName}</span>
      </div>

      {/* ── Profile header ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarFallback className="text-lg bg-indigo-100 text-indigo-700 font-semibold">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-semibold text-slate-900">
                  {fullName}
                  {member.suffix && (
                    <span className="text-slate-400 font-normal ml-1">
                      {member.suffix}
                    </span>
                  )}
                </h2>
                <StatusBadge status={member.status} />
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {member.member_id}
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="h-3 w-3" />
                  {member.phone}
                </span>
                {member.email && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="h-3 w-3" />
                    {member.email}
                  </span>
                )}
                {member.address && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {member.address.city}, {member.address.province}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/members/${member.member_id}/edit`}>
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <RoleGuard allowedRoles={['super_admin', 'branch_manager']}>
                  <DeactivateMemberButton
                    memberId={member.member_id}
                    memberName={[
                      member.first_name,
                      member.middle_name,
                      member.last_name,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={
                      member.status === 'Inactive' ||
                      member.status === 'Deceased'
                    }
                  />
                </RoleGuard>
              </div>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-xs text-slate-400">Member since</p>
              <p className="text-sm font-medium text-slate-700">
                {formatDate(member.date_admitted)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {member.membership_type}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Personal details ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2.5">
            <DetailRow
              label="Date of Birth"
              value={formatDate(member.date_of_birth)}
            />
            <DetailRow label="Gender" value={member.gender} />
            <DetailRow label="Civil Status" value={member.civil_status} />
            <DetailRow label="Nationality" value={member.nationality} />
            {member.tin && <DetailRow label="TIN" value={member.tin} />}
          </CardContent>
        </Card>

        {/* ── Employment ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              Employment
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2.5">
            <DetailRow label="Employer" value={member.employer} />
            <DetailRow label="Occupation" value={member.occupation} />
            <DetailRow
              label="Monthly Income"
              value={
                member.monthly_income
                  ? formatCurrency(member.monthly_income)
                  : undefined
              }
            />
          </CardContent>
        </Card>

        {/* ── Active loans ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loans.length === 0 ? (
              <p className="text-xs text-slate-400">No active loans.</p>
            ) : (
              <div className="space-y-2">
                {loans.map((loan) => (
                  <Link
                    key={loan.id}
                    href={`/loans/${loan.loan_id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        {loan.loan_type}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {loan.loan_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-900">
                        {formatCurrency(loan.outstanding_balance)}
                      </p>
                      <StatusBadge status={loan.status} className="mt-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Savings & shares ── */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <PiggyBank className="h-3.5 w-3.5 text-slate-400" />
                Savings Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {savings.length === 0 ? (
                <p className="text-xs text-slate-400">No savings accounts.</p>
              ) : (
                <div className="space-y-2">
                  {savings.map((s) => (
                    <Link
                      key={s.id}
                      href={`/savings/${s.account_id}`}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-700">
                          {s.product_type}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {s.account_id}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">
                        {formatCurrency(s.current_balance)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {shares && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                  Share Capital
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-2.5">
                <DetailRow
                  label="Paid-up"
                  value={`${shares.paid_shares} shares (${formatCurrency(shares.paid_amount)})`}
                />
                <DetailRow
                  label="Subscribed"
                  value={`${shares.subscribed_shares} shares (${formatCurrency(shares.subscribed_shares * SHARE_PAR_VALUE)})`}
                />
                <DetailRow
                  label="% Paid"
                  value={formatPercent(shares.percentage_paid)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
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

function MemberDetailSkeleton() {
  return (
    <div className="space-y-5 max-w-4xl">
      <Skeleton className="h-4 w-32" />
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
