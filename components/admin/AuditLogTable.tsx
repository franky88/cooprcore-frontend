// frontend/components/admin/AuditLogTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/shared/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatShortDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/types/admin";
import type { PaginatedResponse } from "@/types/api";
import AuditLogDetails from "./AuditLogDetails";

const MODULE_COLORS: Record<string, string> = {
  members: "bg-blue-50 text-blue-700 border-blue-200",
  loans: "bg-indigo-50 text-indigo-700 border-indigo-200",
  savings_accounts: "bg-emerald-50 text-emerald-700 border-emerald-200",
  share_capital: "bg-violet-50 text-violet-700 border-violet-200",
  users: "bg-amber-50 text-amber-700 border-amber-200",
  settings: "bg-red-50 text-red-700 border-red-200",
};

interface AuditLogTableProps {
  result: PaginatedResponse<AuditLog> | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export default function AuditLogTable({
  result,
  isLoading,
  page,
  onPageChange,
}: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const logs = result?.data ?? [];

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs w-36">Date</TableHead>
              <TableHead className="text-xs w-28">Module</TableHead>
              <TableHead className="text-xs">Action</TableHead>
              <TableHead className="text-xs">Performed By</TableHead>
              <TableHead className="text-xs w-32">Target</TableHead>
              <TableHead className="text-xs">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-xs text-slate-400 py-10"
                >
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow key={log.id ?? index} className="text-xs">
                    <TableCell className="text-slate-400">
                    {formatShortDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                    <Badge
                        variant="outline"
                        className={cn(
                        "text-[10px] capitalize",
                        MODULE_COLORS[log.resource] ??
                            "bg-slate-50 text-slate-600 border-slate-200"
                        )}
                    >
                        {log.resource}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium">
                    {log.action}
                    </TableCell>
                    <TableCell>
                    <p className="text-slate-700">{log.actor_name ?? "—"}</p>
                    <p className="text-[10px] font-mono text-slate-400">
                        {log.actor_id}
                    </p>
                    </TableCell>
                    <TableCell className="font-mono text-slate-400 text-[10px]">
                    {log.resource_id ?? "—"}
                    </TableCell>
                    <TableCell className="align-top max-w-[420px] whitespace-normal">
                      <div className="rounded-lg border bg-slate-50/60 p-1">
                        <AuditLogDetails details={log.details} />
                      </div>
                    </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {result && (
        <Pagination
          page={result.pagination.page}
          pages={result.pagination.pages}
          total={result.pagination.total}
          perPage={result.pagination.per_page}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}