// frontend/components/savings/CloseAccountModal.tsx
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
import { Loader2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { CloseAccountPayload } from "@/types/savings";

const closeSchema = z.object({
  or_number: z.string().min(1, "OR Number is required"),
  remarks: z.string().optional(),
});

type CloseValues = z.infer<typeof closeSchema>;

interface CloseAccountModalProps {
  open: boolean;
  memberName: string;
  accountId: string;
  currentBalance: number;
  onClose: () => void;
  onSubmit: (payload: CloseAccountPayload) => Promise<void>;
}

export default function CloseAccountModal({
  open,
  memberName,
  accountId,
  currentBalance,
  onClose,
  onSubmit,
}: CloseAccountModalProps) {
  const [isPending, setIsPending] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CloseValues>({
    resolver: zodResolver(closeSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (values: CloseValues) => {
    setIsPending(true);
    try {
      await onSubmit({
        or_number: values.or_number,
        remarks: values.remarks,
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
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle className="text-base">Close Account</DialogTitle>
          </div>
        </DialogHeader>

        <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-1">
          <p className="text-xs font-semibold text-red-700">
            This action cannot be undone.
          </p>
          <p className="text-xs text-red-600">
            Account <span className="font-mono font-medium">{accountId}</span>{" "}
            for{" "}
            <span className="font-medium">{memberName}</span> will be
            permanently closed.
          </p>
          {currentBalance > 0 && (
            <p className="text-xs text-red-600 mt-1">
              Remaining balance of{" "}
              <span className="font-semibold">
                {formatCurrency(currentBalance)}
              </span>{" "}
              must be withdrawn before closing.
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-3"
          noValidate
        >
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
            <Label className="text-xs font-medium">Remarks</Label>
            <Input
              {...register("remarks")}
              placeholder="Reason for closing…"
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
              disabled={isPending || currentBalance > 0}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              Close Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}