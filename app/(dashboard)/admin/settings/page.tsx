// frontend/app/(dashboard)/admin/settings/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCoopSettings, useUpdateSettings } from "@/hooks/useAdmin";
import { useAddNotification } from "@/store/useStore";
import { extractApiError } from "@/lib/api";
import { useIsMounted } from "@/hooks/useIsMounted";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Settings, Loader2, Save } from "lucide-react";

// ── Zod schema — mirrors backend UpdateSettingsSchema exactly ─────────────────

const loanTypeRateSchema = z.object({
  rate: z.coerce.number().min(0.01, "Min 0.01%").max(100, "Max 100%"),
  max_term: z.coerce.number().int().min(1, "Min 1 month"),
});

const settingsSchema = z.object({
  // General
  coop_name: z.string().min(2, "Required"),
  address: z.string().optional(),
  contact_email: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  contact_phone: z.string().optional(),

  // Rates
  default_loan_rate: z.coerce.number().min(0.01).max(100),
  default_savings_rate: z.coerce.number().min(0).max(100),
  withholding_tax_rate: z.coerce.number().min(0).max(100),
  penalty_rate_monthly: z.coerce.number().min(0).max(100),

  // Share capital
  share_par_value: z.coerce.number().min(1),

  // Loan rules
  max_active_loans: z.coerce.number().int().min(1).max(10),
  comaker_threshold: z.coerce.number().min(1),

  // Account rules
  dormancy_months: z.coerce.number().int().min(1).max(60),
  fiscal_year_start_month: z.coerce.number().int().min(1).max(12),

  // Per-type loan rates
  loan_rates: z
    .object({
      "Multi-Purpose": loanTypeRateSchema,
      Emergency: loanTypeRateSchema,
      Business: loanTypeRateSchema,
      Salary: loanTypeRateSchema,
      Housing: loanTypeRateSchema,
      Educational: loanTypeRateSchema,
    })
    .optional(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

const LOAN_TYPES = [
  "Multi-Purpose",
  "Emergency",
  "Business",
  "Salary",
  "Housing",
  "Educational",
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const addNotification = useAddNotification();
  const mounted = useIsMounted();
  const { data: settings, isLoading } = useCoopSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (settings) {
      reset({
        coop_name: settings.coop_name,
        address: settings.address ?? "",
        contact_email: settings.contact_email ?? "",
        contact_phone: settings.contact_phone ?? "",
        default_loan_rate: settings.default_loan_rate,
        default_savings_rate: settings.default_savings_rate,
        withholding_tax_rate: settings.withholding_tax_rate,
        penalty_rate_monthly: settings.penalty_rate_monthly,
        share_par_value: settings.share_par_value,
        max_active_loans: settings.max_active_loans,
        comaker_threshold: settings.comaker_threshold,
        dormancy_months: settings.dormancy_months,
        fiscal_year_start_month: settings.fiscal_year_start_month,
        loan_rates: settings.loan_rates as SettingsValues["loan_rates"],
      });
    }
  }, [settings, reset]);

  const onSubmit = async (values: SettingsValues) => {
    try {
      await updateSettings(values);
      addNotification({
        type: "success",
        title: "Settings saved",
        message: "Cooperative settings have been updated.",
        minRole: "super_admin",
      });
    } catch (e) {
      addNotification({
        type: "error",
        title: "Failed to save settings",
        message: extractApiError(e),
        minRole: "super_admin",
      });
    }
  };

  if (!mounted || isLoading) return <SettingsSkeleton />;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Admin
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-medium">Settings</span>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-50">
          <Settings className="h-4 w-4 text-violet-600" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">
          Cooperative Settings
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* ── General ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            <SettingsField
              label="Cooperative Name"
              error={errors.coop_name?.message}
            >
              <Input {...register("coop_name")} className="h-8 text-sm" />
            </SettingsField>
            <SettingsField label="Address" error={errors.address?.message}>
              <Input
                {...register("address")}
                placeholder="Street, City, Province"
                className="h-8 text-sm"
              />
            </SettingsField>
            <div className="grid grid-cols-2 gap-4">
              <SettingsField
                label="Contact Email"
                error={errors.contact_email?.message}
              >
                <Input
                  {...register("contact_email")}
                  type="email"
                  placeholder="coop@example.ph"
                  className="h-8 text-sm"
                />
              </SettingsField>
              <SettingsField
                label="Contact Phone"
                error={errors.contact_phone?.message}
              >
                <Input
                  {...register("contact_phone")}
                  placeholder="09171234567"
                  className="h-8 text-sm"
                />
              </SettingsField>
            </div>
          </CardContent>
        </Card>

        {/* ── Interest & Penalty Rates ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Interest & Penalty Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 gap-4">
              <SettingsField
                label="Default Loan Rate (% p.a.)"
                error={errors.default_loan_rate?.message}
              >
                <Input
                  {...register("default_loan_rate")}
                  type="number"
                  step="0.01"
                  className="h-8 text-sm"
                />
              </SettingsField>
              <SettingsField
                label="Default Savings Rate (% p.a.)"
                error={errors.default_savings_rate?.message}
              >
                <Input
                  {...register("default_savings_rate")}
                  type="number"
                  step="0.01"
                  className="h-8 text-sm"
                />
              </SettingsField>
              <SettingsField
                label="Penalty Rate (% per month)"
                error={errors.penalty_rate_monthly?.message}
              >
                <Input
                  {...register("penalty_rate_monthly")}
                  type="number"
                  step="0.01"
                  className="h-8 text-sm"
                />
              </SettingsField>
              <SettingsField
                label="Withholding Tax Rate (%)"
                error={errors.withholding_tax_rate?.message}
              >
                <Input
                  {...register("withholding_tax_rate")}
                  type="number"
                  step="0.01"
                  className="h-8 text-sm"
                />
              </SettingsField>
            </div>
          </CardContent>
        </Card>

        {/* ── Share Capital ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Share Capital
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <SettingsField
              label="Share Par Value (₱ per share)"
              error={errors.share_par_value?.message}
            >
              <Input
                {...register("share_par_value")}
                type="number"
                className="h-8 text-sm max-w-xs"
              />
            </SettingsField>
          </CardContent>
        </Card>

        {/* ── Loan Rules ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Loan Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 gap-4">
              <SettingsField
                label="Max Active Loans per Member"
                error={errors.max_active_loans?.message}
              >
                <Input
                  {...register("max_active_loans")}
                  type="number"
                  min={1}
                  max={10}
                  className="h-8 text-sm"
                />
              </SettingsField>
              <SettingsField
                label="Co-Maker Threshold (₱)"
                error={errors.comaker_threshold?.message}
              >
                <Input
                  {...register("comaker_threshold")}
                  type="number"
                  className="h-8 text-sm"
                />
              </SettingsField>
            </div>
          </CardContent>
        </Card>

        {/* ── Account Rules ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Account Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 gap-4">
              <SettingsField
                label="Dormancy Period (months)"
                error={errors.dormancy_months?.message}
              >
                <Input
                  {...register("dormancy_months")}
                  type="number"
                  min={1}
                  max={60}
                  className="h-8 text-sm"
                />
              </SettingsField>
              <SettingsField
                label="Fiscal Year Start Month (1–12)"
                error={errors.fiscal_year_start_month?.message}
              >
                <Input
                  {...register("fiscal_year_start_month")}
                  type="number"
                  min={1}
                  max={12}
                  className="h-8 text-sm"
                />
              </SettingsField>
            </div>
          </CardContent>
        </Card>

        {/* ── Per-Type Loan Rates ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Loan Type Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-3 gap-3">
              <span className="text-xs font-medium text-slate-400">
                Loan Type
              </span>
              <span className="text-xs font-medium text-slate-400">
                Rate (% p.a.)
              </span>
              <span className="text-xs font-medium text-slate-400">
                Max Term (months)
              </span>
            </div>

            {LOAN_TYPES.map((type) => {
              const rateError = (
                errors.loan_rates as
                  | Record<string, { rate?: { message?: string } }>
                  | undefined
              )?.[type]?.rate?.message;
              const termError = (
                errors.loan_rates as
                  | Record<
                      string,
                      { max_term?: { message?: string } }
                    >
                  | undefined
              )?.[type]?.max_term?.message;

              return (
                <div key={type} className="grid grid-cols-3 gap-3 items-start">
                  <div className="flex items-center h-8">
                    <span className="text-sm font-medium text-slate-700">
                      {type}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Input
                      {...register(`loan_rates.${type}.rate`)}
                      type="number"
                      step="0.01"
                      className="h-8 text-sm"
                    />
                    {rateError && (
                      <p className="text-xs text-red-600">{rateError}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Input
                      {...register(`loan_rates.${type}.max_term`)}
                      type="number"
                      min={1}
                      className="h-8 text-sm"
                    />
                    {termError && (
                      <p className="text-xs text-red-600">{termError}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ── Save button ── */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !isDirty}
            className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SettingsField({
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
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4 max-w-2xl">
      <Skeleton className="h-4 w-32" />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}