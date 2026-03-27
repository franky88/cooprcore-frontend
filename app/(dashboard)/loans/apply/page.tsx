// frontend/app/(dashboard)/loans/apply/page.tsx
import ApplyForm from "@/components/loans/ApplyForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "New Loan Application" };

export default function ApplyLoanPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/loans"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Loans
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-medium">
          New Loan Application
        </span>
      </div>

      <ApplyForm />
    </div>
  );
}