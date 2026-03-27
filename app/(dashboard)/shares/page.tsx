// frontend/app/(dashboard)/shares/page.tsx
"use client";

import { useState } from "react";
import { useShares } from "@/hooks/useShares";
import ShareTable from "@/components/shares/ShareTable";
import { Input } from "@/components/ui/input";
import { TrendingUp, Search } from "lucide-react";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

export default function SharesPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useShares({
    page,
    per_page: DEFAULT_PER_PAGE,
    search: debouncedSearch || undefined,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Share Capital
          </h2>
          {data && (
            <p className="text-xs text-slate-400">
              {data.pagination.total} total records
            </p>
          )}
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          placeholder="Search by member name or ID…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* ── Table ── */}
      <ShareTable
        result={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}