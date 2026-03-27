// frontend/app/(dashboard)/admin/reports/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import MembersReport from "@/components/reports/MembersReport";
import LoansReport from "@/components/reports/LoansReport";
import SavingsReport from "@/components/reports/SavingsReport";
import SharesReport from "@/components/reports/SharesReport";
import { ChevronLeft, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "members", label: "Members" },
  { key: "loans", label: "Loans" },
  { key: "savings", label: "Savings" },
  { key: "shares", label: "Share Capital" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("members");

  return (
    <div className="space-y-5">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Admin
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-medium">Reports</span>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50">
          <BarChart3 className="h-4 w-4 text-indigo-600" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Reports</h2>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Report content ── */}
      <div>
        {activeTab === "members" && <MembersReport />}
        {activeTab === "loans" && <LoansReport />}
        {activeTab === "savings" && <SavingsReport />}
        {activeTab === "shares" && <SharesReport />}
      </div>
    </div>
  );
}