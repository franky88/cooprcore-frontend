import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MemberLoanApplicationForm from '@/components/member-portal/MemberLoanApplicationForm';

export default function MemberLoanApplyPage() {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Apply for a Loan</CardTitle>
      </CardHeader>
      <CardContent>
        <MemberLoanApplicationForm />
      </CardContent>
    </Card>
  );
}
