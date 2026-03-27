// frontend/app/(dashboard)/admin/audit-logs/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuditLogs } from "@/hooks/useAdmin";
import AuditLogTable from "@/components/admin/AuditLogTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollText, ChevronLeft } from "lucide-react";
import { DEFAULT_PER_PAGE } from "@/lib/constants";

const MODULES = [
  "members",
  "loans",
  "savings_accounts",
  "share_capital",
  "users",
  "settings",
] as const;

export default function AuditLogsPage() {
  const [page, setPage] = useState<number>(1);
  const [resource, setResource] = useState<string>("");

  const { data, isLoading } = useAuditLogs({
    page,
    per_page: DEFAULT_PER_PAGE,
    resource: resource || undefined,
  });

  // console.log("Audit logs", data?.data[0].details)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Admin
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-medium">Audit Logs</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-50">
            <ScrollText className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Audit Logs
            </h2>
            {data && (
              <p className="text-xs text-slate-400">
                {data.pagination.total} total entries
              </p>
            )}
          </div>
        </div>

        <Select
          value={resource || "all"}  // ← bound to resource
          onValueChange={(v) => {
            setResource(v === "all" ? "" : v);  // ← updates resource
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue placeholder="All modules" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modules</SelectItem>
            {MODULES.map((m) => (
              <SelectItem key={m} value={m} className="capitalize">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AuditLogTable
        result={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}