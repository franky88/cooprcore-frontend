// frontend/components/shares/PaymentForm.tsx
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
import { Loader2, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { PostSharePaymentPayload } from "@/types/share";

const paymentSchema = z.object({
  amount_paid: z.coerce
    .number()
    .min(1, "Amount must be greater than 0"),
  or_number: z.string().min(1, "OR Number is required"),
  payment_date: z.string().min(1, "Payment date is required"),
  remarks: z.string().optional(),
});

type PaymentValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  open: boolean;
  memberName: string;
  shareId: string;
  outstandingAmount: number;
  onClose: () => void;
  onSubmit: (payload: PostSharePaymentPayload) => Promise<void>;
}

export default function PaymentForm({
  open,
  memberName,
  shareId: _shareId,
  outstandingAmount,
  onClose,
  onSubmit,
}: PaymentFormProps) {
  const [isPending, setIsPending] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
  } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_date: new Date().toISOString().split("T")[0],
    },
  });

  const amountPaid = watch("amount_paid");

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (values: PaymentValues) => {
    if (values.amount_paid > outstandingAmount) {
      setError("amount_paid", {
        message: `Cannot exceed outstanding amount of ${formatCurrency(outstandingAmount)}`,
      });
      return;
    }

    setIsPending(true);
    try {
      await onSubmit({
        amount_paid: values.amount_paid,
        or_number: values.or_number,
        payment_date: values.payment_date,
        remarks: values.remarks,
      });
      handleClose();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <DialogTitle className="text-base">
              Record Share Payment
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-0.5 py-1">
          <p className="text-xs text-slate-500">
            Member:{" "}
            <span className="font-medium text-slate-800">{memberName}</span>
          </p>
          <p className="text-xs text-slate-500">
            Outstanding:{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(outstandingAmount)}
            </span>
          </p>
        </div>

        {/* Amount preview */}
        {Number(amountPaid) > 0 && (
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-indigo-600">Paying</span>
            <span className="text-sm font-bold text-indigo-700">
              {formatCurrency(Number(amountPaid))}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-3"
          noValidate
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Amount to Pay (₱) <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("amount_paid")}
              type="number"
              step="0.01"
              placeholder={`max ${formatCurrency(outstandingAmount)}`}
              className="h-8 text-sm"
              autoFocus
            />
            {errors.amount_paid && (
              <p className="text-xs text-red-600">
                {errors.amount_paid.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                OR Number <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("or_number")}
                placeholder="OR-2026-00001"
                className="h-8 text-sm"
              />
              {errors.or_number && (
                <p className="text-xs text-red-600">
                  {errors.or_number.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Payment Date <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("payment_date")}
                type="date"
                className="h-8 text-sm"
              />
              {errors.payment_date && (
                <p className="text-xs text-red-600">
                  {errors.payment_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Remarks</Label>
            <Input
              {...register("remarks")}
              placeholder="Optional notes…"
              className="h-8 text-sm"
            />
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
              disabled={isPending || outstandingAmount <= 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}