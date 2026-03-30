import LoanApplicationReviewPanel from '@/components/loans/LoanApplicationReviewPanel';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    applicationId: string;
  }>;
}

export default async function LoanApplicationDetailPage({ params }: PageProps) {
  const { applicationId } = await params;
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
        <Link
          href="/loans/applications"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Applications
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-600 font-medium">
          {applicationId}
        </span>
      </div>
      <LoanApplicationReviewPanel applicationId={applicationId} />
    </div>
  );
}
