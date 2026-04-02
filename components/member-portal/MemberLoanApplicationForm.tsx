'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateMemberLoanApplication } from '@/hooks/useLoanApplications';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const LOAN_TYPES = [
  'Multi-Purpose',
  'Emergency',
  'Business',
  'Salary',
  'Housing',
  'Educational',
];

export default function MemberLoanApplicationForm() {
  const router = useRouter();
  const createMutation = useCreateMemberLoanApplication();

  const [loanType, setLoanType] = useState('Emergency');
  const [principal, setPrincipal] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [purpose, setPurpose] = useState('');
  const [coMakerMemberId, setCoMakerMemberId] = useState('');
  const [coMakerName, setCoMakerName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const principalNumber = Number(principal || 0);
  const requiresCoMaker = principalNumber > 30000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      await createMutation.mutateAsync({
        loan_type: loanType,
        principal: Number(principal),
        term_months: Number(termMonths),
        purpose,
        remarks,
        co_makers:
          requiresCoMaker && coMakerMemberId && coMakerName
            ? [{ member_id: coMakerMemberId, name: coMakerName }]
            : [],
      });

      router.push('/member/loans');
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to submit application.',
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Loan Type</label>
          <Select value={loanType} onValueChange={setLoanType}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Select loan type" />
            </SelectTrigger>
            <SelectContent>
              {LOAN_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Principal Amount
          </label>
          <Input
            type="number"
            min="1"
            step="0.01"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Term (months)
          </label>
          <Input
            type="number"
            min="1"
            value={termMonths}
            onChange={(e) => setTermMonths(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Remarks</label>
          <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Purpose</label>
        <textarea
          className="min-h-30 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
        />
      </div>

      {requiresCoMaker ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm font-medium text-amber-700">
            Co-maker is required for loan amounts above ₱30,000.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Co-maker Member ID
              </label>
              <Input
                value={coMakerMemberId}
                onChange={(e) => setCoMakerMemberId(e.target.value)}
                required={requiresCoMaker}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Co-maker Name
              </label>
              <Input
                value={coMakerName}
                onChange={(e) => setCoMakerName(e.target.value)}
                required={requiresCoMaker}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending
            ? 'Submitting...'
            : 'Submit Loan Application'}
        </Button>
      </div>
    </form>
  );
}
