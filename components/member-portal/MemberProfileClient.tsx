'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemberProfile } from '@/hooks/member/useMemberPortal';

export default function MemberProfileClient() {
  const { data, isLoading, isError } = useMemberProfile();

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading profile...</div>;
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-600">Unable to load your profile.</div>
    );
  }

  const fullAddress = data.address
    ? [
        data.address.street,
        data.address.barangay,
        data.address.city,
        data.address.province,
        data.address.zip_code,
      ]
        .filter(Boolean)
        .join(', ')
    : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <span className="text-sm font-semibold text-indigo-700">
            {data.first_name?.charAt(0)}
            {data.last_name?.charAt(0)}
          </span>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {data.first_name} {data.last_name}
          </h2>
          <p className="text-sm text-slate-400">Member ID: {data.member_id}</p>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Member ID" value={data.member_id} />
          <Field label="Status" value={data.status} />
          <Field label="Membership Type" value={data.membership_type || '—'} />
          <Field label="First Name" value={data.first_name} />
          <Field label="Middle Name" value={data.middle_name || '—'} />
          <Field label="Last Name" value={data.last_name} />
          <Field label="Email" value={data.email || '—'} />
          <Field label="Phone" value={data.phone || '—'} />
          <Field label="Occupation" value={data.occupation || '—'} />
          <Field label="Employer" value={data.employer || '—'} />
          <Field
            label="Address"
            value={fullAddress}
            className="md:col-span-2 xl:col-span-3"
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  className?: string;
}

function Field({ label, value, className }: FieldProps) {
  return (
    <div className={className}>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
