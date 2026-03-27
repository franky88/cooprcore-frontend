// frontend/components/shared/StatusBadge.tsx
import { cn } from "@/lib/utils";

type StatusVariant =
  // Member
  | "Active"
  | "Inactive"
  | "Suspended"
  | "Deceased"
  // Loan
  | "Pending"
  | "Approved"
  | "Released"
  | "Current"
  | "Past Due"
  | "Closed"
  | "Rejected"
  // Savings
  | "Dormant";

const STATUS_STYLES: Record<StatusVariant, string> = {
  // Member
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Suspended: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Deceased: "bg-slate-100 text-slate-500 ring-slate-400/20",
  // Loan
  Pending: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Approved: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Released: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Current: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Past Due": "bg-red-50 text-red-700 ring-red-600/20",
  Closed: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Rejected: "bg-red-50 text-red-600 ring-red-500/20",
  // Savings
  Dormant: "bg-orange-50 text-orange-700 ring-orange-600/20",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles =
    STATUS_STYLES[status as StatusVariant] ??
    "bg-slate-100 text-slate-600 ring-slate-500/20";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles,
        className
      )}
    >
      {status}
    </span>
  );
}