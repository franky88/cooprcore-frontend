'use client';

import { useProfile } from '@/hooks/useProfile';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Building2,
  IdCard,
  Mail,
  ShieldCheck,
  User2,
} from 'lucide-react';
import ChangePasswordCard from './ChangePasswordCard';

function formatRole(role: string): string {
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

interface InfoRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border p-4">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="wrap-break-word font-medium">{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileErrorState({ message }: { message: string }) {
  return (
    <Card className="rounded-2xl border-destructive/40">
      <CardContent className="flex items-start gap-3 p-6">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
        <div>
          <p className="font-semibold">Unable to load profile</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfilePageContent() {
  const { data, isLoading, isError, error } = useProfile();

  console.log('data', data);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !data) {
    const message =
      error instanceof Error
        ? error.message
        : 'Something went wrong while fetching your profile.';
    return <ProfileErrorState message={message} />;
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            View your staff account details and access information.
          </p>
        </div>

        <Badge
          variant="secondary"
          className="w-fit rounded-full px-3 py-1 text-sm"
        >
          {formatRole(data.role)}
        </Badge>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            This information is based on your authenticated account.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <InfoRow
            label="Full Name"
            value={data.full_name}
            icon={<User2 className="h-4 w-4" />}
          />

          <InfoRow
            label="Email Address"
            value={data.email}
            icon={<Mail className="h-4 w-4" />}
          />

          <InfoRow
            label="Role"
            value={formatRole(data.role)}
            icon={<ShieldCheck className="h-4 w-4" />}
          />

          <InfoRow
            label="Employee ID"
            value={data.employee_id || 'Not available'}
            icon={<IdCard className="h-4 w-4" />}
          />

          <InfoRow
            label="Branch"
            value={data.branch || 'Not assigned'}
            icon={<Building2 className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      <ChangePasswordCard />
    </div>
  );
}
