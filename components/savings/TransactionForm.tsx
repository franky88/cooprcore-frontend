// frontend/components/savings/TransactionForm.tsx
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
import { Loader2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { PostTransactionPayload } from "@/types/savings";

const PAYMENT_METHODS = ["Cash", "Check", "Online Transfer", "Others"] as const;

const transactionSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  or_number: z.string().min(1, "OR Number is required"),
  payment_method: z.enum(PAYMENT_METHODS, { required_error: "Payment method is required" }),
  transaction_date: z.string().min(1, "Date is required"),
  remarks: z.string().optional(),
});

type TransactionValues = z.infer<typeof transactionSchema>;
type TransactionType = "Deposit" | "Withdrawal";

interface TransactionFormProps {
  open: boolean;
  type: TransactionType;
  memberName: string;
  currentBalance: number;
  onClose: () => void;
  onSubmit: (payload: PostTransactionPayload) => Promise<void>;
}

export default function TransactionForm({
  open,
  type,
  memberName,
  currentBalance,
  onClose,
  onSubmit,
}: TransactionFormProps) {
  const [isPending, setIsPending] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_date: new Date().toISOString().split("T")[0],
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (values: TransactionValues) => {
    // Business rule: withdrawal cannot exceed balance
    if (type === "Withdrawal" && values.amount > currentBalance) {
      setError("amount", {
        message: `Cannot exceed current balance of ${formatCurrency(currentBalance)}`,
      });
      return;
    }

    setIsPending(true);
    try {
      await onSubmit({
        transaction_type: type,
        amount: values.amount,
        or_number: values.or_number,
        payment_method: values.payment_method,
        transaction_date: values.transaction_date,
        remarks: values.remarks,
      });
      handleClose();
    } finally {
      setIsPending(false);
    }
  };

  const isDeposit = type === "Deposit";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            {isDeposit ? (
              <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
            ) : (
              <ArrowUpCircle className="h-5 w-5 text-amber-600" />
            )}
            <DialogTitle className="text-base">
              Post {type}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-0.5 py-1">
          <p className="text-xs text-slate-500">
            Member:{" "}
            <span className="font-medium text-slate-800">{memberName}</span>
          </p>
          <p className="text-xs text-slate-500">
            Current Balance:{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(currentBalance)}
            </span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-3"
          noValidate
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Amount (₱) <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("amount")}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={cn(
                "h-8 text-sm",
                isDeposit
                  ? "focus-visible:ring-emerald-400"
                  : "focus-visible:ring-amber-400"
              )}
              autoFocus
            />
            {errors.amount && (
              <p className="text-xs text-red-600">{errors.amount.message}</p>
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
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <select
                {...register("payment_method")}
                className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select…</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.payment_method && (
                <p className="text-xs text-red-600">{errors.payment_method.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("transaction_date")}
                type="date"
                className="h-8 text-sm"
              />
              {errors.transaction_date && (
                <p className="text-xs text-red-600">
                  {errors.transaction_date.message}
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
              disabled={isPending}
              className={
                isDeposit
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }
            >
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              Post {type}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}