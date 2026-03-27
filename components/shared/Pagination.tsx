// frontend/components/shared/Pagination.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  page,
  pages,
  total,
  perPage,
  onPageChange,
  className,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  if (pages <= 1) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-3",
        className
      )}
    >
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}–{to}</span>{" "}
        of <span className="font-medium text-slate-700">{total}</span> records
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Page numbers — show max 5 */}
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === pages ||
              Math.abs(p - page) <= 1
          )
          .reduce<(number | "...")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-7 w-7 text-xs",
                  p === page && "bg-indigo-600 hover:bg-indigo-700 border-indigo-600"
                )}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </Button>
            )
          )}

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}