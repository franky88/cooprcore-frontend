// frontend/components/loans/ApplyForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApplyLoan } from "@/hooks/useLoans";
import { useAddNotification } from "@/store/useStore";
import { useLoanDefaults } from "@/hooks/useLoanDefaults"; // ← replaces LOAN_DEFAULTS
import { extractApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import LoanCalculator from "./LoanCalculator";
import { Loader2 } from "lucide-react";
import type { LoanType } from "@/types/loan";

const applySchema = z.object({
  member_id: z.string().min(1, "Member ID is required"),
  loan_type: z.enum([
    "Multi-Purpose",
    "Emergency",
    "Business",
    "Salary",
    "Housing",
    "Educational",
  ]),
  principal: z.coerce.number().min(1000, "Minimum loan amount is ₱1,000"),
  term_months: z.coerce.number().min(1, "Minimum term is 1 month"),
  purpose: z.string().min(5, "Please describe the loan purpose"),
  co_maker_1: z.string().optional(),
  co_maker_2: z.string().optional(),
});

type ApplyValues = z.infer<typeof applySchema>;

export default function ApplyForm() {
  const router = useRouter();
  const addNotification = useAddNotification();
  const { mutateAsync: applyLoan, isPending } = useApplyLoan();
  const loanDefaults = useLoanDefaults(); // ← reads from settings

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      loan_type: "Multi-Purpose",
      term_months: 12,
    },
  });

  const loanType = watch("loan_type") as LoanType;
  const principal = watch("principal");
  const termMonths = watch("term_months");

  // ← These now read from settings via the hook
  const maxTerm = loanDefaults[loanType]?.max_term ?? 36;
  const rate = loanDefaults[loanType]?.rate ?? 12;
  const requiresCoMaker =
    (principal ?? 0) > 30000; // still uses 30k as UI hint — backend enforces actual threshold

  const onSubmit = async (values: ApplyValues) => {
    const coMakers = [values.co_maker_1, values.co_maker_2].filter(
      Boolean
    ) as string[];

    try {
      const loan = await applyLoan({
        member_id: values.member_id,
        loan_type: values.loan_type,
        principal: values.principal,
        term_months: values.term_months,
        purpose: values.purpose,
        co_makers: coMakers.length > 0 ? coMakers : undefined,
      });

      addNotification({
        type: "success",
        title: "Loan application submitted",
        message: `${loan.loan_id} is now pending approval.`,
      });
      router.push(`/loans/${loan.loan_id}`);
    } catch (error) {
      addNotification({
        type: "error",
        title: "Application failed",
        message: extractApiError(error),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      {/* ── Left — form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-5 space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Loan Details
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Member ID <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("member_id")}
                placeholder="M-2026-0001"
                className="h-8 text-sm font-mono"
              />
              {errors.member_id && (
                <p className="text-xs text-red-600">
                  {errors.member_id.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Loan Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={loanType}
                  onValueChange={(v) =>
                    setValue("loan_type", v as LoanType, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(loanDefaults).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Principal (₱) <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("principal")}
                  type="number"
                  placeholder="50000"
                  className="h-8 text-sm"
                />
                {errors.principal && (
                  <p className="text-xs text-red-600">
                    {errors.principal.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Term (months, max {maxTerm}){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("term_months")}
                  type="number"
                  min={1}
                  max={maxTerm}
                  className="h-8 text-sm"
                />
                {errors.term_months && (
                  <p className="text-xs text-red-600">
                    {errors.term_months.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Interest Rate (% p.a.)
                </Label>
                <Input
                  value={`${rate}%`}
                  readOnly
                  className="h-8 text-sm bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Purpose <span className="text-red-500">*</span>
              </Label>
              <Textarea
                {...register("purpose")}
                placeholder="Describe the purpose of the loan…"
                rows={2}
                className="text-sm resize-none"
              />
              {errors.purpose && (
                <p className="text-xs text-red-600">
                  {errors.purpose.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Co-makers ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Co-Makers
              </p>
              {requiresCoMaker && (
                <span className="text-[10px] text-amber-600 bg-amber-50 ring-1 ring-amber-200 rounded px-1.5 py-0.5">
                  Required for loans &gt; ₱30,000
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Co-Maker 1 Member ID
                {requiresCoMaker && (
                  <span className="text-red-500 ml-0.5">*</span>
                )}
              </Label>
              <Input
                {...register("co_maker_1")}
                placeholder="M-2026-0002"
                className="h-8 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Co-Maker 2 Member ID (optional)
              </Label>
              <Input
                {...register("co_maker_2")}
                placeholder="M-2026-0003"
                className="h-8 text-sm font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            )}
            Submit Application
          </Button>
        </div>
      </form>

      {/* ── Right — live calculator (also uses settings rates) ── */}
      <div>
        <LoanCalculator
          value={{
            loanType,
            principal: Number(principal) || 0,
            rate,                          // ← from settings
            term: Number(termMonths) || 0,
          }}
          showSchedule={true}
        />
      </div>
    </div>
  );
}