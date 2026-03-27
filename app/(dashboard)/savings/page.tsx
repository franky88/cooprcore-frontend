// frontend/app/(dashboard)/savings/page.tsx
"use client";

import { useState } from "react";
import { useSavingsAccounts } from "@/hooks/useSavings";
import AccountTable from "@/components/savings/AccountTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PiggyBank, Search } from "lucide-react";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";
import type { SavingsStatus, SavingsProductType } from "@/types/savings";

export default function SavingsPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<SavingsStatus | "">("");
  const [productType, setProductType] = useState<SavingsProductType | "">("");
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useSavingsAccounts({
    page,
    per_page: DEFAULT_PER_PAGE,
    search: debouncedSearch || undefined,
    status: status || undefined,
    product_type: productType || undefined,
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
          <PiggyBank className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Savings & Deposits
          </h2>
          {data && (
            <p className="text-xs text-slate-400">
              {data.pagination.total} total accounts
            </p>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by account ID or member…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select
          value={status || "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? "" : (v as SavingsStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Dormant">Dormant</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={productType || "all"}
          onValueChange={(v) => {
            setProductType(v === "all" ? "" : (v as SavingsProductType));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue placeholder="All products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            <SelectItem value="Regular Savings">Regular Savings</SelectItem>
            <SelectItem value="Time Deposit">Time Deposit</SelectItem>
            <SelectItem value="Special Savings">Special Savings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <AccountTable
        result={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}