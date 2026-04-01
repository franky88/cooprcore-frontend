import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useStaffLoanApplications } from '@/hooks/useLoanApplications';

export function LoanApplicationsButton() {
  const router = useRouter();

  const { data, isLoading } = useStaffLoanApplications({
    page: 1,
    per_page: 1,
    status: 'Submitted',
  });

  const submittedCount = data?.pagination.total ?? 0;

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => router.push('/loans/applications')}
      className="relative"
    >
      Applications
      <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-[11px] font-medium text-white">
        {isLoading ? '...' : submittedCount}
      </span>
    </Button>
  );
}
