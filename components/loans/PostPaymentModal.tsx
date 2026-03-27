// frontend/components/loans/PostPaymentModal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { PostPaymentPayload, PaymentMethod } from "@/types/loan";

const paymentSchema = z.object({
  amount_paid: z.coerce
    .number()
    .min(1, "Amount must be greater than 0"),
  payment_method: z.enum(["Cash", "Bank Transfer", "Auto-debit"]),
  or_number: z.string().min(1, "OR Number is required"),
  payment_date: z.string().min(1, "Payment date is required"),
  remarks: z.string().optional(),
});

type PaymentValues = z.infer<typeof paymentSchema>;

interface PostPaymentModalProps {
  open: boolean;
  loanId: string;
  memberName: string;
  monthlyAmortization: number;
  outstandingBalance: number;
  onClose: () => void;
  onSubmit: (payload: PostPaymentPayload) => Promise<void>;
}

export default function PostPaymentModal({
  open,
  loanId: _loanId,
  memberName,
  monthlyAmortization,
  outstandingBalance,
  onClose,
  onSubmit,
}: PostPaymentModalProps) {
  const [isPending, setIsPending] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount_paid: Math.min(monthlyAmortization, outstandingBalance),
      payment_method: "Cash",
      payment_date: new Date().toISOString().split("T")[0],
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (values: PaymentValues) => {
    // if (values.amount_paid > outstandingBalance) {
    //   return;
    // }
    setIsPending(true);
    try {
      await onSubmit({
        amount_paid: values.amount_paid,
        payment_method: values.payment_method as PaymentMethod,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Post Loan Payment</DialogTitle>
        </DialogHeader>

        <div className="py-1 space-y-1">
          <p className="text-xs text-slate-500">
            Member:{" "}
            <span className="font-medium text-slate-800">{memberName}</span>
          </p>
          <p className="text-xs text-slate-500">
            Outstanding Balance:{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(outstandingBalance)}
            </span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Amount Paid (₱) <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("amount_paid")}
                type="number"
                step="0.01"
                className="h-8 text-sm"
              />
              {errors.amount_paid && (
                <p className="text-xs text-red-600">
                  {errors.amount_paid.message}
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
              <Label className="text-xs font-medium">Payment Method</Label>
              <Select
                defaultValue="Cash"
                onValueChange={(v) =>
                  setValue("payment_method", v as PaymentMethod)
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Auto-debit">Auto-debit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Remarks</Label>
              <Input
                {...register("remarks")}
                placeholder="Optional notes…"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
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
              Post Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}