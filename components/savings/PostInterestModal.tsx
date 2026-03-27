// frontend/components/savings/PostInterestModal.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Percent } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import type { PostInterestPayload } from "@/types/savings";

const interestSchema = z.object({
  as_of_date: z.string().min(1, "Posting date is required"),
});

type InterestValues = z.infer<typeof interestSchema>;

interface PostInterestModalProps {
  open: boolean;
  memberName: string;
  currentBalance: number;
  interestRate: number;
  onClose: () => void;
  onSubmit: (payload: PostInterestPayload) => Promise<void>;
}

export default function PostInterestModal({
  open,
  memberName,
  currentBalance,
  interestRate,
  onClose,
  onSubmit,
}: PostInterestModalProps) {
  const [isPending, setIsPending] = useState<boolean>(false);

  // Compute interest preview
  // Monthly: balance × rate / 12
  // 20% withholding tax applies
  const grossInterest = (currentBalance * interestRate) / 100 / 12;
  const withholdingTax = grossInterest * 0.2;
  const netInterest = grossInterest - withholdingTax;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InterestValues>({
    resolver: zodResolver(interestSchema),
    defaultValues: {
      as_of_date: new Date().toISOString().split("T")[0],
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (values: InterestValues) => {
    setIsPending(true);
    try {
      await onSubmit({
        as_of_date: values.as_of_date,
      });
      handleClose();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <Percent className="h-5 w-5 text-indigo-600" />
            <DialogTitle className="text-base">Post Monthly Interest</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-0.5 py-1">
          <p className="text-xs text-slate-500">
            Member:{" "}
            <span className="font-medium text-slate-800">{memberName}</span>
          </p>
          <p className="text-xs text-slate-500">
            Balance:{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(currentBalance)}
            </span>
          </p>
        </div>

        {/* Interest preview */}
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
            Interest Preview
          </p>
          <div className="space-y-1">
            <PreviewRow
              label={`Gross Interest (${formatPercent(interestRate)} ÷ 12)`}
              value={formatCurrency(grossInterest)}
            />
            <PreviewRow
              label="Withholding Tax (20%)"
              value={`- ${formatCurrency(withholdingTax)}`}
              valueClass="text-red-600"
            />
            <div className="border-t border-indigo-200 pt-1">
              <PreviewRow
                label="Net Interest to Credit"
                value={formatCurrency(netInterest)}
                valueClass="text-indigo-700 font-semibold"
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-3"
          noValidate
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Posting Date <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("as_of_date")}
                type="date"
                className="h-8 text-sm"
              />
              {errors.as_of_date && (
                <p className="text-xs text-red-600">
                  {errors.as_of_date.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
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
              Post Interest
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PreviewRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-indigo-600">{label}</span>
      <span className={`text-xs font-medium ${valueClass ?? "text-slate-700"}`}>
        {value}
      </span>
    </div>
  );
}