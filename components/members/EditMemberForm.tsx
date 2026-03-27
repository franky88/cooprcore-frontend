'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, UserRound, Loader2, Save } from 'lucide-react';

import { useMember, useUpdateMember } from '@/hooks/useMembers';
import { useStore } from '@/store/useStore';
import {
  memberFormSchema,
  type MemberFormValues,
  type CivilStatus,
  type Gender,
  type IdType,
  type MemberStatus,
  type MembershipType,
} from '@/types/member';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditMemberFormProps {
  memberId: string;
}

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string | Record<string, string[]> }
      | undefined;

    if (typeof data?.error === 'string') {
      return data.error;
    }

    if (data?.error && typeof data.error === 'object') {
      const firstEntry = Object.values(data.error)[0];
      if (Array.isArray(firstEntry) && firstEntry.length > 0) {
        return firstEntry[0];
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to update member.';
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-sm font-semibold text-slate-700">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </CardContent>
    </Card>
  );
}

function EditMemberSkeleton() {
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
      <div className="space-y-4">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

export default function EditMemberForm({ memberId }: EditMemberFormProps) {
  const router = useRouter();
  const addNotification = useStore((state) => state.addNotification);

  const { data: member, isLoading, isError } = useMember(memberId);
  const updateMutation = useUpdateMember(memberId);

  const defaultValues = useMemo<MemberFormValues | undefined>(() => {
    if (!member) return undefined;

    return {
      first_name: member.first_name ?? '',
      middle_name: member.middle_name ?? '',
      last_name: member.last_name ?? '',
      suffix: member.suffix ?? '',
      gender: (member.gender ?? 'Male') as Gender,
      civil_status: (member.civil_status ?? 'Single') as CivilStatus,
      nationality: member.nationality ?? 'Filipino',
      tin: member.tin ?? '',
      email: member.email ?? '',
      phone: member.phone ?? '',
      employer: member.employer ?? '',
      occupation: member.occupation ?? '',
      monthly_income: member.monthly_income ?? 0,
      membership_type: (member.membership_type ?? 'Regular') as MembershipType,
      status: (member.status ?? 'Active') as MemberStatus,
      id_type: (member.id_type ?? 'SSS') as IdType,
      id_number: member.id_number ?? '',
      address: {
        street: member.address?.street ?? '',
        barangay: member.address?.barangay ?? '',
        city: member.address?.city ?? '',
        province: member.address?.province ?? '',
        zip_code: member.address?.zip_code ?? '',
      },
      nominee: {
        name: member.nominee?.name ?? '',
        relationship: member.nominee?.relationship ?? '',
        phone: member.nominee?.phone ?? '',
      },
    };
  }, [member]);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      gender: 'Male',
      civil_status: 'Single',
      nationality: 'Filipino',
      tin: '',
      email: '',
      phone: '',
      employer: '',
      occupation: '',
      monthly_income: 0,
      membership_type: 'Regular',
      status: 'Active',
      id_type: 'SSS',
      id_number: '',
      address: {
        street: '',
        barangay: '',
        city: '',
        province: '',
        zip_code: '',
      },
      nominee: {
        name: '',
        relationship: '',
        phone: '',
      },
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onSubmit = async (values: MemberFormValues) => {
    try {
      await updateMutation.mutateAsync({
        ...values,
        email: values.email || undefined,
        tin: values.tin || undefined,
      });

      addNotification({
        type: 'success',
        title: 'Member updated',
        message: `${values.first_name} ${values.last_name} (${memberId}) has been updated.`,
      });

      router.push(`/members/${memberId}`);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update failed',
        message: getApiErrorMessage(error),
      });
    }
  };

  if (isLoading) return <EditMemberSkeleton />;

  if (isError || !member || !defaultValues) {
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

  const fullName = [member.first_name, member.middle_name, member.last_name]
    .filter(Boolean)
    .join(' ');

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
        <Link
          href={`/members/${memberId}`}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          {fullName}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-medium">Edit</span>
      </div>

      {/* ── Header ── */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <UserRound className="h-6 w-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-semibold text-slate-900">
                  Edit Member
                </h2>
              </div>

              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {member.member_id}
              </p>

              <p className="text-xs text-slate-500 mt-3">
                Update member profile, contact details, employment, and nominee
                information.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href={`/members/${memberId}`}>Cancel</Link>
              </Button>

              <Button
                type="button"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
                onClick={handleSubmit(onSubmit)}
                disabled={updateMutation.isPending || isSubmitting}
              >
                {updateMutation.isPending || isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SectionCard title="Personal Information">
          <Field label="First Name" error={errors.first_name?.message}>
            <Input {...register('first_name')} className="h-8 text-sm" />
          </Field>

          <Field label="Middle Name" error={errors.middle_name?.message}>
            <Input {...register('middle_name')} className="h-8 text-sm" />
          </Field>

          <Field label="Last Name" error={errors.last_name?.message}>
            <Input {...register('last_name')} className="h-8 text-sm" />
          </Field>

          <Field label="Suffix" error={errors.suffix?.message}>
            <Input {...register('suffix')} className="h-8 text-sm" />
          </Field>

          <Field label="Gender" error={errors.gender?.message}>
            <Select
              value={watch('gender')}
              onValueChange={(value) =>
                setValue('gender', value as Gender, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Civil Status" error={errors.civil_status?.message}>
            <Select
              value={watch('civil_status')}
              onValueChange={(value) =>
                setValue('civil_status', value as CivilStatus, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select civil status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Widowed">Widowed</SelectItem>
                <SelectItem value="Separated">Separated</SelectItem>
                <SelectItem value="Annulled">Annulled</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Nationality" error={errors.nationality?.message}>
            <Input {...register('nationality')} className="h-8 text-sm" />
          </Field>

          <Field label="TIN" error={errors.tin?.message}>
            <Input
              {...register('tin')}
              placeholder="123-456-789-000"
              className="h-8 text-sm"
            />
          </Field>
        </SectionCard>

        <SectionCard title="Contact Information">
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              {...register('email')}
              className="h-8 text-sm"
            />
          </Field>

          <Field label="Phone" error={errors.phone?.message}>
            <Input
              {...register('phone')}
              placeholder="09XXXXXXXXX"
              className="h-8 text-sm"
            />
          </Field>

          <Field label="Street" error={errors.address?.street?.message}>
            <Input {...register('address.street')} className="h-8 text-sm" />
          </Field>

          <Field label="Barangay" error={errors.address?.barangay?.message}>
            <Input {...register('address.barangay')} className="h-8 text-sm" />
          </Field>

          <Field label="City" error={errors.address?.city?.message}>
            <Input {...register('address.city')} className="h-8 text-sm" />
          </Field>

          <Field label="Province" error={errors.address?.province?.message}>
            <Input {...register('address.province')} className="h-8 text-sm" />
          </Field>

          <Field label="ZIP Code" error={errors.address?.zip_code?.message}>
            <Input {...register('address.zip_code')} className="h-8 text-sm" />
          </Field>
        </SectionCard>

        <SectionCard title="Employment and Membership">
          <Field label="Employer" error={errors.employer?.message}>
            <Input {...register('employer')} className="h-8 text-sm" />
          </Field>

          <Field label="Occupation" error={errors.occupation?.message}>
            <Input {...register('occupation')} className="h-8 text-sm" />
          </Field>

          <Field label="Monthly Income" error={errors.monthly_income?.message}>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('monthly_income', { valueAsNumber: true })}
              className="h-8 text-sm"
            />
          </Field>

          <Field
            label="Membership Type"
            error={errors.membership_type?.message}
          >
            <Select
              value={watch('membership_type')}
              onValueChange={(value) =>
                setValue('membership_type', value as MembershipType, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select membership type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Associate">Associate</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Status" error={errors.status?.message}>
            <Select
              value={watch('status')}
              onValueChange={(value) =>
                setValue('status', value as MemberStatus, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Deceased">Deceased</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="ID Type" error={errors.id_type?.message}>
            <Select
              value={watch('id_type')}
              onValueChange={(value) =>
                setValue('id_type', value as IdType, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SSS">SSS</SelectItem>
                <SelectItem value="GSIS">GSIS</SelectItem>
                <SelectItem value="PhilHealth">PhilHealth</SelectItem>
                <SelectItem value="Pag-IBIG">Pag-IBIG</SelectItem>
                <SelectItem value="TIN">TIN</SelectItem>
                <SelectItem value="Passport">Passport</SelectItem>
                <SelectItem value="Driver's License">
                  Driver&apos;s License
                </SelectItem>
                <SelectItem value="Voter's ID">Voter&apos;s ID</SelectItem>
                <SelectItem value="PRC ID">PRC ID</SelectItem>
                <SelectItem value="National ID">National ID</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="ID Number" error={errors.id_number?.message}>
            <Input {...register('id_number')} className="h-8 text-sm" />
          </Field>
        </SectionCard>

        <SectionCard title="Nominee">
          <Field label="Nominee Name" error={errors.nominee?.name?.message}>
            <Input {...register('nominee.name')} className="h-8 text-sm" />
          </Field>

          <Field
            label="Relationship"
            error={errors.nominee?.relationship?.message}
          >
            <Input
              {...register('nominee.relationship')}
              className="h-8 text-sm"
            />
          </Field>

          <Field label="Nominee Phone" error={errors.nominee?.phone?.message}>
            <Input
              {...register('nominee.phone')}
              placeholder="09XXXXXXXXX"
              className="h-8 text-sm"
            />
          </Field>
        </SectionCard>

        {/* mobile action bar */}
        <div className="sm:hidden flex flex-col-reverse gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/members/${memberId}`}>Cancel</Link>
          </Button>

          <Button
            type="submit"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
            disabled={updateMutation.isPending || isSubmitting}
          >
            {updateMutation.isPending || isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
