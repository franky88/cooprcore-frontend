// frontend/components/shares/SubscribeModal.tsx
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
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { SHARE_PAR_VALUE } from "@/lib/constants";
import type { UpdateSubscriptionPayload } from "@/types/share";

const subscribeSchema = z.object({
  additional_shares: z.coerce
    .number()
    .int("Must be a whole number")
    .min(1, "Must add at least 1 share"),
});

type SubscribeValues = z.infer<typeof subscribeSchema>;

interface SubscribeModalProps {
  open: boolean;
  memberName: string;
  currentSubscribedShares: number;
  onClose: () => void;
  onSubmit: (payload: UpdateSubscriptionPayload) => Promise<void>;
}

export default function SubscribeModal({
  open,
  memberName,
  currentSubscribedShares,
  onClose,
  onSubmit,
}: SubscribeModalProps) {
  const [isPending, setIsPending] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<SubscribeValues>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: { additional_shares: 10 },
  });

  const additionalShares = watch("additional_shares");
  const addAmount = (Number(additionalShares) || 0) * SHARE_PAR_VALUE;
  const newTotal = currentSubscribedShares + (Number(additionalShares) || 0);
  const newTotalAmount = newTotal * SHARE_PAR_VALUE;

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (values: SubscribeValues) => {
    setIsPending(true);
    try {
      await onSubmit({ additional_shares: values.additional_shares });
      handleClose();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">
            Update Share Subscription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-0.5 py-1">
          <p className="text-xs text-slate-500">
            Member:{" "}
            <span className="font-medium text-slate-800">{memberName}</span>
          </p>
          <p className="text-xs text-slate-500">
            Current Subscription:{" "}
            <span className="font-semibold text-slate-900">
              {currentSubscribedShares} shares (
              {formatCurrency(currentSubscribedShares * SHARE_PAR_VALUE)})
            </span>
          </p>
        </div>

        {/* Preview */}
        {Number(additionalShares) > 0 && (
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-600">Additional shares</span>
              <span className="text-sm font-bold text-indigo-700">
                +{Number(additionalShares)} shares
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-600">Amount to pay</span>
              <span className="text-xs font-semibold text-indigo-700">
                {formatCurrency(addAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-indigo-200 pt-1">
              <span className="text-xs text-indigo-600">New total subscription</span>
              <span className="text-xs font-semibold text-emerald-600">
                {newTotal} shares ({formatCurrency(newTotalAmount)})
              </span>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-3"
          noValidate
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Additional Shares{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("additional_shares")}
              type="number"
              min={Math.max(currentSubscribedShares, 10)}
              className="h-8 text-sm"
              autoFocus
            />
            {errors.additional_shares && (
              <p className="text-xs text-red-600">
                {errors.additional_shares.message}
              </p>
            )}
            <p className="text-[10px] text-slate-400">
              Minimum 10 shares · ₱{SHARE_PAR_VALUE} par value per share ·
              Cannot reduce existing subscription
            </p>
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
              Update Subscription
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}