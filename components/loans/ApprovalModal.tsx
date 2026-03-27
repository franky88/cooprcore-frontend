// frontend/components/loans/ApprovalModal.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalAction = "approve" | "reject" | "release";

// ── Schemas ───────────────────────────────────────────────────────────────────
const approveSchema = z.object({});

const rejectSchema = z.object({
  reason: z.string().min(5, "Please provide a reason (min 5 chars)"),
});

const releaseSchema = z.object({
  or_number: z.string().min(1, "OR Number is required"),
  release_date: z.string().min(1, "Release date is required"),
});

type RejectValues = z.infer<typeof rejectSchema>;
type ReleaseValues = z.infer<typeof releaseSchema>;

interface ApprovalModalProps {
  action: ModalAction | null;
  loanId: string;
  memberName: string;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onRelease: (orNumber: string, date: string) => Promise<void>;
}

const ACTION_CONFIG = {
  approve: {
    title: "Approve Loan",
    description: "This action will approve the loan application.",
    icon: CheckCircle,
    iconClass: "text-emerald-600",
    confirmClass: "bg-emerald-600 hover:bg-emerald-700",
    confirmLabel: "Approve Loan",
  },
  reject: {
    title: "Reject Loan",
    description: "This action will reject the loan application.",
    icon: XCircle,
    iconClass: "text-red-500",
    confirmClass: "bg-red-600 hover:bg-red-700",
    confirmLabel: "Reject Loan",
  },
  release: {
    title: "Release Loan Funds",
    description: "Record the disbursement of approved loan funds.",
    icon: Banknote,
    iconClass: "text-indigo-600",
    confirmClass: "bg-indigo-600 hover:bg-indigo-700",
    confirmLabel: "Confirm Release",
  },
};

export default function ApprovalModal({
  action,
  loanId: _loanId,
  memberName,
  onClose,
  onApprove,
  onReject,
  onRelease,
}: ApprovalModalProps) {
  const [isPending, setIsPending] = useState<boolean>(false);

  const rejectForm = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
  });

  const releaseForm = useForm<ReleaseValues>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      release_date: new Date().toISOString().split("T")[0],
    },
  });

  if (!action) return null;

  const config = ACTION_CONFIG[action];

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      if (action === "approve") {
        await onApprove();
      } else if (action === "reject") {
        const valid = await rejectForm.trigger();
        if (!valid) return;
        const values = rejectForm.getValues();
        await onReject(values.reason);
      } else if (action === "release") {
        const valid = await releaseForm.trigger();
        if (!valid) return;
        const values = releaseForm.getValues();
        await onRelease(values.or_number, values.release_date);
      }
      onClose();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={!!action} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <config.icon className={cn("h-5 w-5", config.iconClass)} />
            <DialogTitle className="text-base">{config.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600">
            {config.description}{" "}
            <span className="font-medium text-slate-900">{memberName}</span>
          </p>

          {/* Reject — reason required */}
          {action === "reject" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                {...rejectForm.register("reason")}
                placeholder="Explain why this loan is being rejected…"
                rows={3}
                className="text-sm resize-none"
              />
              {rejectForm.formState.errors.reason && (
                <p className="text-xs text-red-600">
                  {rejectForm.formState.errors.reason.message}
                </p>
              )}
            </div>
          )}

          {/* Release — OR number + date */}
          {action === "release" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  OR Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...releaseForm.register("or_number")}
                  placeholder="OR-2026-00001"
                  className="h-8 text-sm"
                />
                {releaseForm.formState.errors.or_number && (
                  <p className="text-xs text-red-600">
                    {releaseForm.formState.errors.or_number.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Release Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...releaseForm.register("release_date")}
                  type="date"
                  className="h-8 text-sm"
                />
                {releaseForm.formState.errors.release_date && (
                  <p className="text-xs text-red-600">
                    {releaseForm.formState.errors.release_date.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isPending}
            className={config.confirmClass}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : null}
            {config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}