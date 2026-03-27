// frontend/components/reports/ReportCard.tsx
import { cn } from "@/lib/utils";

interface ReportCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "default" | "green" | "amber" | "red" | "indigo";
  className?: string;
}

const ACCENT_STYLES = {
  default: "bg-slate-50 border-slate-200",
  green: "bg-emerald-50 border-emerald-200",
  amber: "bg-amber-50 border-amber-200",
  red: "bg-red-50 border-red-200",
  indigo: "bg-indigo-50 border-indigo-200",
};

const VALUE_STYLES = {
  default: "text-slate-900",
  green: "text-emerald-700",
  amber: "text-amber-700",
  red: "text-red-700",
  indigo: "text-indigo-700",
};

export default function ReportCard({
  label,
  value,
  sub,
  accent = "default",
  className,
}: ReportCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-1",
        ACCENT_STYLES[accent],
        className
      )}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn("text-xl font-bold", VALUE_STYLES[accent])}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}